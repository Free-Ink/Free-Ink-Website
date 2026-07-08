import { Lead, P, H2, A, Ul, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Sticky() {
  return (
    <>
      <Lead>
        A minimal Sticky reader starter: scan EPUBs from the SD card, render an All Books list with
        FreeInkUI, open a book with FreeInkBook, and use FreeInkApp for screen transitions and input
        routing.
      </Lead>

      <Callout title="What this starter intentionally leaves out">
        <p>
          No covers, tabs, settings, sleep screen, metadata cache, folder navigation, font picker,
          progress persistence, or real TOC list. The goal is the smallest SDK-native reader loop.
        </p>
      </Callout>

      <H2>1. Project setup</H2>
      <P>
        Vendor the <A href="https://github.com/Free-Ink/freeink-sdk">FreeInk SDK</A> beside your firmware:
      </P>
      <CodeBlock lang="bash">{`git submodule add https://github.com/Free-Ink/freeink-sdk.git freeink-sdk
git submodule update --init --recursive`}</CodeBlock>

      <P>
        The important dependencies are <Code>FreeInkUI</Code> and <Code>FreeInkApp</Code> for the UI
        shell, <Code>FreeInkBook</Code> for EPUB layout/cache/rendering, and <Code>SDCardManager</Code>
        for the card.
      </P>
      <P>The reader path in this tutorial uses the same SDK stack you use in a real app:</P>
      <Ul>
        <Li><Code>book::Book</Code> opens the EPUB package and exposes metadata, TOC, manifest, and spine.</Li>
        <Li><Code>book::ChapterLayout::layout()</Code> paginates one spine item into cache records.</Li>
        <Li><Code>book::PageCacheWriter</Code> receives those pages during layout.</Li>
        <Li><Code>book::PageCacheReader</Code> reopens cached pages for fast page turns.</Li>
        <Li><Code>book::PageRenderer</Code> renders the current cached page into the framebuffer.</Li>
        <Li><Code>ui::tapZones()</Code> provides invisible reader hit zones.</Li>
        <Li><Code>ui::readerChrome()</Code> draws reader status chrome over the page.</Li>
      </Ul>
      <CodeBlock lang="platformio.ini">{`[env:sticky]
platform = https://github.com/pioarduino/platform-espressif32/releases/download/55.03.37/platform-espressif32.zip
framework = arduino
board = esp32-s3-devkitc1-n16r8
board_build.mcu = esp32s3
board_build.flash_mode = qio
board_build.psram_type = opi
board_upload.flash_size = 16MB
build_flags =
  -std=gnu++17
  -DFREEINK_DEVICE_STICKY=1
  -DEINK_DISPLAY_SINGLE_BUFFER_MODE=1
  -DBOARD_HAS_PSRAM
  -DARDUINO_USB_CDC_ON_BOOT=1
  -DARDUINO_USB_MODE=1
lib_deps =
  BoardConfig=symlink://freeink-sdk/libs/hardware/BoardConfig
  EInkDisplay=symlink://freeink-sdk/libs/display/FreeInkDisplay
  InputManager=symlink://freeink-sdk/libs/hardware/InputManager
  SDCardManager=symlink://freeink-sdk/libs/hardware/SDCardManager
  FreeInkUI=symlink://freeink-sdk/libs/ui/FreeInkUI
  FreeInkBook=symlink://freeink-sdk/libs/book/FreeInkBook`}</CodeBlock>

      <H2>2. Storage adapters</H2>
      <P>
        FreeInkBook does not know about SD cards. The app supplies a <Code>book::BookSource</Code> for
        random-access reads and a <Code>book::CacheStorage</Code> for page-cache files. Put this in
        <Code>src/BookStorageAdapters.h</Code>.
      </P>
      <CodeBlock lang="cpp">{`#pragma once

#include <BookStorage.h>
#include <SDCardManager.h>

class SdBookSource : public freeink::book::BookSource {
 public:
  bool open(const char* path) {
    file_ = SdMan.open(path, O_RDONLY);
    return file_ && (size_ = file_.fileSize()) > 0;
  }
  void close() {
    if (file_) file_.close();
  }
  int32_t readAt(uint64_t offset, void* dst, uint32_t len) override {
    if (!file_ || !file_.seekSet(offset)) return -1;
    return file_.read(dst, len);
  }
  uint64_t size() const override { return size_; }

 private:
  FsFile file_;
  uint64_t size_ = 0;
};

class SdCacheStorage : public freeink::book::CacheStorage {
 public:
  void setDir(const char* dir) {
    snprintf(dir_, sizeof(dir_), "%s", dir);
    SdMan.ensureDirectoryExists(dir_);
  }
  bool exists(const char* name) override { return SdMan.exists(path(name)); }
  bool remove(const char* name) override { return SdMan.remove(path(name)); }
  int64_t fileSize(const char* name) override {
    FsFile f = SdMan.open(path(name), O_RDONLY);
    if (!f) return -1;
    const int64_t size = f.fileSize();
    f.close();
    return size;
  }
  int32_t readAt(const char* name, uint32_t offset, void* dst, uint32_t len) override {
    FsFile f = SdMan.open(path(name), O_RDONLY);
    if (!f || !f.seekSet(offset)) return -1;
    const int32_t n = f.read(dst, len);
    f.close();
    return n;
  }
  bool beginWrite(const char* name) override {
    snprintf(commitPath_, sizeof(commitPath_), "%s/%s", dir_, name);
    write_ = SdMan.open(path("_tmp.fibp"), O_WRONLY | O_CREAT | O_TRUNC);
    return static_cast<bool>(write_);
  }
  bool write(const void* data, uint32_t len) override {
    return write_ && write_.write(data, len) == len;
  }
  bool endWrite() override {
    if (!write_) return false;
    write_.close();
    SdMan.remove(commitPath_);
    return SdMan.rename(path("_tmp.fibp"), commitPath_);
  }

 private:
  const char* path(const char* name) {
    snprintf(pathBuf_, sizeof(pathBuf_), "%s/%s", dir_, name);
    return pathBuf_;
  }
  char dir_[96] = "/BookCache";
  char pathBuf_[192];
  char commitPath_[192];
  FsFile write_;
};`}</CodeBlock>

      <H2>3. FreeInkApp shell</H2>
      <P>
        FreeInkApp owns the screen function, action routing, tap flash, and transition invalidation.
        Screens are plain functions that receive <Code>App::ScreenType&amp;</Code> and lay themselves out
        with the FreeInkUI screen builder.
      </P>
      <CodeBlock lang="cpp">{`#include <Arduino.h>
#include <BoardConfig.h>
#include <EInkDisplay.h>
#include <FreeInkApp.h>
#include <FreeInkBook.h>
#include <FreeInkUIBookFont.h>
#include <FreeInkUIDisplayTarget.h>
#include <InputManager.h>
#include <SDCardManager.h>
#include <cache/PageCache.h>
#include <layout/ChapterLayout.h>
#include <render/PageRenderer.h>

#include "BookStorageAdapters.h"

using namespace freeink;
using book::BookStatus;

enum : ui::ActionId {
  ActionOpenBook = 1,
  ActionPageNext,
  ActionPagePrev,
  ActionBackToReader,
  ActionBackToLibrary,
};

enum class Screen : uint8_t { Library, Reader, Menu };

using App = ui::FreeInkApp<48, 16>;

EInkDisplay display(
  BoardConfig::ACTIVE.display.sclk, BoardConfig::ACTIVE.display.mosi,
  BoardConfig::ACTIVE.display.cs,   BoardConfig::ACTIVE.display.dc,
  BoardConfig::ACTIVE.display.rst,  BoardConfig::ACTIVE.display.busy);

InputManager input;
ui::DisplayTarget* target = nullptr;
App* app = nullptr;
Screen screen = Screen::Library;

void libraryScreen(App::ScreenType& s, void*);
void readerScreen(App::ScreenType& s, void*);
void menuScreen(App::ScreenType& s, void*);

void goToPage(Screen next, bool initialPaint = false) {
  float sx0, sy0, sx1, sy1;
  while (input.popSwipe(sx0, sy0, sx1, sy1)) {
    // Drop gestures completed on the previous screen.
  }

  screen = next;
  app->clearTapFlash();
  switch (next) {
    case Screen::Library:
      app->setScreen(libraryScreen, nullptr, ui::RefreshHint::None);
      break;
    case Screen::Reader:
      app->setScreen(readerScreen, nullptr, ui::RefreshHint::None);
      break;
    case Screen::Menu:
      app->setScreen(menuScreen, nullptr, ui::RefreshHint::None);
      break;
  }

  if (initialPaint) app->invalidate(ui::RefreshHint::Full);
  else app->invalidateTransition();
}`}</CodeBlock>

      <H2>4. Library and reader state</H2>
      <P>
        The starter keeps the library as a fixed array of <Code>ui::ListItem</Code> rows and opens one
        chapter at a time through <Code>book::PageCacheReader</Code>. The page-cache filename comes from
        <Code>book::pageCacheName()</Code>, and cache invalidation comes from{' '}
        <Code>book::layoutGenerationHash()</Code>.
      </P>
      <CodeBlock lang="cpp">{`static constexpr int kMaxBooks = 64;

char bookPaths[kMaxBooks][160];
char bookTitles[kMaxBooks][64];
ui::ListItem bookItems[kMaxBooks];
int bookCount = 0;
uint16_t bookTop = 0;
uint16_t bookVisibleRows = 0;
int16_t selectedBook = 0;

uint8_t* bookBuf = nullptr;
uint8_t* scratchBuf = nullptr;
uint8_t* indexBuf = nullptr;

ui::BitmapBookFont builtinFont;
book::FontChain fonts;

struct ReaderSession {
  SdBookSource source;
  SdCacheStorage cache;
  book::Arena bookArena;
  book::Arena scratch;
  book::Arena indexArena;
  book::Book bk;
  book::LayoutParams params;
  book::PageCacheReader reader;
  char cacheDir[96];
  char cacheName[64];  // PageCacheReader borrows this name while open.
  uint16_t spineIndex = 0;
  uint32_t pageInChapter = 0;
  bool open = false;

  bool begin(const char* path) {
    end();
    bookArena.init(bookBuf, 512 * 1024);
    scratch.init(scratchBuf, 512 * 1024);
    indexArena.init(indexBuf, 64 * 1024);
    if (!source.open(path)) return false;
    if (bk.open(source, bookArena, scratch) != BookStatus::Ok) return false;

    const uint32_t id = book::ZipCatalog::hashPath(path);
    snprintf(cacheDir, sizeof(cacheDir), "/BookCache/%08x", id);
    cache.setDir(cacheDir);

    params = book::LayoutParams{};
    params.pageWidth = target->logicalWidth();
    params.pageHeight = target->logicalHeight();
    params.marginLeft = params.marginRight = 24;
    params.marginTop = params.marginBottom = 24;
    params.baseSizePx = 18;
    params.lineSpacingPct = 120;
    params.font = &fonts;

    open = ensureChapter(0) == BookStatus::Ok;
    return open;
  }

  uint32_t generation() const {
    return book::layoutGenerationHash(params, /*fontFingerprint=*/1);
  }

  BookStatus ensureChapter(uint16_t nextSpine) {
    if (nextSpine >= bk.spineCount()) return BookStatus::NotFound;
    spineIndex = nextSpine;
    pageInChapter = 0;

    const uint32_t hash = generation();
    if (!book::pageCacheName(spineIndex, hash, cacheName, sizeof(cacheName))) {
      return BookStatus::IoError;
    }

    indexArena.reset();
    BookStatus st = reader.open(cache, cacheName, hash, indexArena);
    if (st == BookStatus::Ok) return st;

    const book::ManifestItem* item = bk.spineItem(spineIndex);
    const book::ZipEntry* entry = item ? bk.zip().find(item->href) : nullptr;
    if (!item || !entry) return BookStatus::NotFound;

    const size_t mark = scratch.mark();
    book::PageCacheWriter writer;
    if (!writer.begin(cache, cacheName, hash, scratch)) {
      scratch.release(mark);
      return BookStatus::IoError;
    }

    uint32_t totalChars = 0;
    st = book::ChapterLayout::layout(
      source, bk.zip(), *entry, item->href, params, scratch, writer,
      nullptr, &totalChars);
    writer.setTotalChars(totalChars);
    if (st == BookStatus::Ok && !writer.finish()) st = BookStatus::IoError;
    scratch.release(mark);
    if (st != BookStatus::Ok) return st;

    indexArena.reset();
    return reader.open(cache, cacheName, hash, indexArena);
  }

  bool turn(int dir) {
    if (!open) return false;
    if (dir > 0 && pageInChapter + 1 < reader.pageCount()) {
      ++pageInChapter;
      return true;
    }
    if (dir > 0 && spineIndex + 1 < bk.spineCount()) {
      return ensureChapter(spineIndex + 1) == BookStatus::Ok;
    }
    if (dir < 0 && pageInChapter > 0) {
      --pageInChapter;
      return true;
    }
    if (dir < 0 && spineIndex > 0 && ensureChapter(spineIndex - 1) == BookStatus::Ok) {
      pageInChapter = reader.pageCount() > 0 ? reader.pageCount() - 1 : 0;
      return true;
    }
    return false;
  }

  void renderCurrent(const book::FrameTarget& frame) {
    if (!open) return;
    const size_t mark = scratch.mark();
    book::Page page{};
    if (reader.readPage(pageInChapter, scratch, &page) == BookStatus::Ok) {
      book::PageRenderer::renderText(page, fonts, frame, nullptr);
      book::PageRenderer::renderImages(page, source, bk.zip(), scratch, frame);
    }
    scratch.release(mark);
  }

  void end() {
    source.close();
    open = false;
  }
} session;`}</CodeBlock>

      <H2>5. FreeInkUI screens</H2>
      <P>
        The library, reader, and menu are real FreeInkApp screens. Use the screen builder for layout
        (<Code>s.header()</Code>, <Code>s.body()</Code>, <Code>s.navHeader()</Code>) and FreeInkUI
        components for interactive surfaces.
      </P>
      <CodeBlock lang="cpp">{`bool isEpubFile(const char* name) {
  const size_t len = strlen(name);
  return len > 5 && strcasecmp(name + len - 5, ".epub") == 0;
}

bool isHiddenOrSystemDir(const char* name) {
  return name == nullptr || name[0] == 0 || name[0] == '.' ||
         strcasecmp(name, "BookCache") == 0 ||
         strcasecmp(name, "System Volume Information") == 0 ||
         strcasecmp(name, "fonts") == 0 ||
         strcasecmp(name, "sleep") == 0 ||
         strcasecmp(name, "screenshots") == 0 ||
         strcasecmp(name, "themes") == 0;
}

void scanBooksIn(const char* dirPath, uint8_t depth) {
  if (bookCount >= kMaxBooks) return;
  const bool root = dirPath[0] == '/' && dirPath[1] == 0;
  FsFile dir = SdMan.open(dirPath, O_RDONLY);
  if (!dir || !dir.isDirectory()) {
    if (dir) dir.close();
    return;
  }

  for (FsFile f = dir.openNextFile(); f && bookCount < kMaxBooks; f = dir.openNextFile()) {
    char name[128];
    f.getName(name, sizeof(name));

    if (f.isDirectory()) {
      if (depth < 6 && !isHiddenOrSystemDir(name)) {
        char child[160];
        snprintf(child, sizeof(child), "%s%s%s", dirPath, root ? "" : "/", name);
        f.close();
        scanBooksIn(child, static_cast<uint8_t>(depth + 1));
        continue;
      }
      f.close();
      continue;
    }

    f.close();
    if (name[0] == '.' || !isEpubFile(name)) continue;

    snprintf(bookPaths[bookCount], sizeof(bookPaths[bookCount]),
             "%s%s%s", dirPath, root ? "" : "/", name);
    snprintf(bookTitles[bookCount], sizeof(bookTitles[bookCount]), "%.*s",
             static_cast<int>(strlen(name) - 5), name);
    bookItems[bookCount] = ui::ListItem{};
    bookItems[bookCount].label = bookTitles[bookCount];
    bookItems[bookCount].actionValue = static_cast<int16_t>(bookCount);
    ++bookCount;
  }
  if (dir) dir.close();
}

void scanBooks() {
  bookCount = 0;
  for (int i = 0; i < kMaxBooks; ++i) bookItems[i] = ui::ListItem{};
  scanBooksIn("/", 0);
}

void libraryScreen(App::ScreenType& s, void*) {
  s.header("All Books");
  ui::Rect listRect = s.body().inset({0, 10, 0, 10});

  ui::ListProps list;
  list.items = bookItems;
  list.count = bookCount;
  list.selectedIndex = selectedBook;
  list.topIndex = bookTop;
  list.action = ActionOpenBook;
  list.labelText = s.theme().bodyText;
  list.rowStyles = ui::selectedPlainListRowStyles();
  list.rowHeight = s.theme().rowHeight;
  list.scrollIndicator = true;

  bookVisibleRows = ui::listVisibleRows(listRect, list.rowHeight, list.rowGap);
  ui::list(s.frame(), listRect, list);
}

void readerScreen(App::ScreenType& s, void*) {
  // The visible page is composited in loop() after FreeInkApp registers these
  // hit zones. Reader chrome is also drawn after the page so text cannot
  // overwrite it.
  const ui::Rect body = s.body();
  const int16_t third = static_cast<int16_t>(body.width / 3);
  const ui::TapZone zones[3] = {
    {ui::Rect{body.x, body.y, third, body.height}, ActionPagePrev},
    {ui::Rect{static_cast<int16_t>(body.x + third), body.y, third, body.height}, ActionBackToReader},
    {ui::Rect{static_cast<int16_t>(body.x + 2 * third), body.y,
              static_cast<int16_t>(body.width - 2 * third), body.height}, ActionPageNext},
  };

  ui::TapZonesProps taps;
  taps.zones = zones;
  taps.count = 3;
  taps.swipeLeft = ActionPageNext;
  taps.swipeRight = ActionPagePrev;
  taps.back = ActionBackToLibrary;
  ui::tapZones(s.frame(), body, taps);
}

void menuScreen(App::ScreenType& s, void*) {
  s.navHeader("Reader Menu", ActionBackToReader, ui::BitmapRef{}, nullptr, ui::EdgesNone);
  s.centeredText("Swipe up from the bottom edge to resume.");
}

void drawReaderChromeOverlay() {
  ui::InteractionBuffer<1> interactions;
  ui::InputSnapshot input;
  ui::Frame<1> frame(*target, app->device(), input, interactions, app->assets());

  char pageLabel[24];
  snprintf(pageLabel, sizeof(pageLabel), "%lu/%lu",
           static_cast<unsigned long>(session.pageInChapter + 1),
           static_cast<unsigned long>(session.reader.pageCount()));

  ui::ReaderChromeProps chrome;
  chrome.showTop = false;
  chrome.bottom.title = "Reader";
  chrome.bottom.trailing = pageLabel;
  chrome.bottom.text = app->theme().smallText;
  chrome.bottom.fillBackground = true;
  ui::readerChrome(frame, frame.safeRect(), chrome);
}`}</CodeBlock>

      <H2>6. Actions, setup, and render loop</H2>
      <P>
        Action handlers only mutate state and invalidate or transition screens. For the reader,
        <Code>{'app->render()'}</Code> registers the FreeInkUI input zones, then the app clears the visual
        framebuffer, renders the cached EPUB page, draws reader chrome over it, and starts the async panel
        refresh.
      </P>
      <P>
        The explicit <Code>display.clearScreen(0xFF)</Code> in the reader branch matters:
        <Code>book::PageRenderer</Code> draws ink but does not clear old glyph pixels.
      </P>
      <CodeBlock lang="cpp">{`void onOpenBook(const ui::ActionEvent& e, void*) {
  selectedBook = e.value;
  if (selectedBook >= 0 && selectedBook < bookCount &&
      session.begin(bookPaths[selectedBook])) {
    goToPage(Screen::Reader);
  }
}

void onPageTurn(const ui::ActionEvent& e, void*) {
  if (session.turn(e.action == ActionPageNext ? 1 : -1)) {
    app->invalidate(ui::RefreshHint::Fast);
  }
}

void onBackToReader(const ui::ActionEvent&, void*) {
  goToPage(Screen::Reader);
}

void onBackToLibrary(const ui::ActionEvent&, void*) {
  session.end();
  goToPage(Screen::Library);
}

void setup() {
  BoardConfig::holdPowerRails();
  BoardConfig::releaseSdRail();
  delay(10);

  SdMan.begin();
  display.begin();
  input.begin();
  input.beginAsync(/*taskPriority=*/2, /*pollMs=*/10);

  static ui::DisplayTarget displayTarget(
    display.getFrameBuffer(), display.getDisplayWidth(),
    display.getDisplayHeight(), display.getDisplayWidthBytes(),
    ui::Orientation::Portrait);
  static App application(displayTarget, displayTarget.deviceContext());
  target = &displayTarget;
  app = &application;
  app->setClearColor(ui::Color::White);

  bookBuf = static_cast<uint8_t*>(ps_malloc(512 * 1024));
  scratchBuf = static_cast<uint8_t*>(ps_malloc(512 * 1024));
  indexBuf = static_cast<uint8_t*>(ps_malloc(64 * 1024));
  fonts.add(&builtinFont);

  app->on(ActionOpenBook, onOpenBook);
  app->on(ActionPageNext, onPageTurn);
  app->on(ActionPagePrev, onPageTurn);
  app->on(ActionBackToReader, onBackToReader);
  app->on(ActionBackToLibrary, onBackToLibrary);

  scanBooks();
  goToPage(Screen::Library, /*initialPaint=*/true);
}

void loop() {
  float sx0, sy0, sx1, sy1;
  while (input.popSwipe(sx0, sy0, sx1, sy1)) {
    const ui::Point a = ui::touchToLogical(app->device(), sx0, sy0);
    const ui::Point b = ui::touchToLogical(app->device(), sx1, sy1);
    const int16_t dx = static_cast<int16_t>(b.x - a.x);
    const int16_t dy = static_cast<int16_t>(b.y - a.y);
    const bool vertical = abs(dy) > abs(dx);

    if (screen == Screen::Reader && vertical &&
        a.y <= app->device().height * 14 / 100 && dy > 0) {
      goToPage(Screen::Menu);
      break;
    }
    if (screen != Screen::Library && vertical &&
        a.y >= app->device().height * 86 / 100 && dy < 0) {
      if (screen == Screen::Menu) goToPage(Screen::Reader);
      else { session.end(); goToPage(Screen::Library); }
      break;
    }
    if (screen == Screen::Library && vertical && bookVisibleRows > 0 &&
        bookCount > bookVisibleRows) {
      const uint16_t step = bookVisibleRows > 1 ? bookVisibleRows - 1 : 1;
      const uint16_t maxTop = static_cast<uint16_t>(bookCount - bookVisibleRows);
      bookTop = dy < 0 ? min<uint16_t>(bookTop + step, maxTop)
                       : (bookTop > step ? bookTop - step : 0);
      app->invalidate(ui::RefreshHint::Fast);
    }
  }

  float nx, ny;
  while (input.popTouchTap(nx, ny)) {
    const ui::Point p = ui::touchToLogical(app->device(), nx, ny);
    ui::InputSnapshot tap;
    tap.touchReleased = true;
    tap.touchX = p.x;
    tap.touchY = p.y;
    app->route(tap);
  }

  static ui::RefreshHint pending = ui::RefreshHint::None;
  if (app->invalidated()) {
    app->render();
    if (screen == Screen::Reader && session.open) {
      // PageRenderer only inks the glyph/image pixels present on this page; it
      // does not erase pixels from the previous page. Start every reader frame
      // from white before compositing the cached page.
      display.clearScreen(0xFF);
      book::FrameTarget frame{
        display.getFrameBuffer(),
        static_cast<int16_t>(display.getDisplayWidth()),
        static_cast<int16_t>(display.getDisplayHeight()),
        static_cast<int16_t>(display.getDisplayWidthBytes()),
        book::FrameFormat::Mono1Dithered,
        book::FrameRotation::Portrait,
      };
      session.renderCurrent(frame);
      drawReaderChromeOverlay();
    }
    const ui::RefreshHint hint = app->lastRenderRefreshHint();
    if (static_cast<uint8_t>(hint) > static_cast<uint8_t>(pending)) pending = hint;
  }

  if (pending != ui::RefreshHint::None && !display.refreshBusy()) {
    ui::presentAsync(display, pending);
    pending = ui::RefreshHint::None;
  }
}`}</CodeBlock>

      <H2>7. Gesture contract</H2>
      <P>
        Keep edge gestures strict. The bottom-home gesture only triggers when the swipe starts in the
        bottom 14% of the screen, so ordinary list scrolling does not exit the screen. The menu gesture is
        the mirror: top-edge downward swipe, starting in the top 14% of the reader surface.
      </P>

      <H2>8. E-paper refresh policy</H2>
      <P>
        Page turns use <Code>ui::RefreshHint::Fast</Code>, just like the full reader app. Ghost prevention
        is handled below the reader: <Code>ui::presentAsync(display, hint)</Code> calls
        <Code>FreeInkDisplay::displayBufferAsync()</Code>, which supplies the panel driver with the
        previous displayed frame. On differential panels, that previous-frame baseline is what keeps fast
        reader turns from smearing. The first boot paint is still <Code>Full</Code>, and each panel driver
        may promote or clear internally when its controller requires it.
      </P>

      <H2>9. Where to grow from here</H2>
      <P>
        Keep the first version boring. A reader gets painful when navigation, caching, and power behavior
        are added too late, so grow the starter in this order:
      </P>
      <Ul>
        <Li>
          <strong>Persist reading position.</strong> Write a tiny progress record beside the page cache,
          for example <Code>/BookCache/&lt;book-id&gt;/progress.bin</Code>, with the current spine,
          character offset, font size, and percentage. Save after page turns and before leaving the reader.
        </Li>
        <Li>
          <strong>Cache library metadata.</strong> Parse each EPUB once for title, author, and cover href,
          then store that in <Code>/BookCache</Code>. The list should render from cached metadata and only
          fall back to filenames when metadata is missing.
        </Li>
        <Li>
          <strong>Add a real reader menu.</strong> Replace the placeholder menu with a scrollable TOC list.
          Use the book TOC when present, fall back to spine items when it is not, and keep the bottom-edge
          swipe as the fast path back to the page.
        </Li>
        <Li>
          <strong>Make opening feel responsive.</strong> If a first open needs to paginate, draw a
          FreeInkUI toast or popup before indexing. Kick off the panel refresh, then do CPU/SD work while
          the e-paper update is in flight.
        </Li>
        <Li>
          <strong>Improve the library one surface at a time.</strong> Add folder navigation before covers
          if you expect large SD cards. Add covers later, cache decoded thumbnails, and keep the All Books
          path as a simple list so it stays fast.
        </Li>
        <Li>
          <strong>Add settings after the core loop is solid.</strong> Start with font size, line height,
          margins, orientation, and embedded CSS. Store settings in one small binary or JSON file and make
          every setting invalidate the page cache only when it changes layout.
        </Li>
        <Li>
          <strong>Support the hardware buttons.</strong> Map side buttons to page up/down in the reader,
          list scrolling in the library/menu, and power to a sleep screen plus deep sleep. Keep touch and
          buttons using the same action handlers where possible.
        </Li>
        <Li>
          <strong>Watch memory early.</strong> EPUB parsing, page layout, image decoding, and UI buffers
          all compete for RAM. Prefer fixed-size arenas, cache files on SD, and one decoded cover buffer
          per visible item instead of keeping the whole library hot.
        </Li>
      </Ul>
    </>
  )
}
