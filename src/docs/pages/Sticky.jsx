import { Lead, P, H2, A, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Sticky() {
  return (
    <>
      <Lead>
        The smallest useful Sticky app: scan EPUBs from the SD card, show them in a FreeInkUI list,
        open one into a paged reader, and use the same edge gestures as the full reader app.
      </Lead>

      <Callout title="What this starter intentionally leaves out">
        <p>
          No covers, tabs, settings, sleep screen, metadata cache, folder navigation, font picker, progress
          persistence, or TOC parsing. It is a deliberately tiny spine for a real reader.
        </p>
      </Callout>

      <H2>1. Project setup</H2>
      <P>
        Vendor the <A href="https://github.com/Free-Ink/freeink-sdk">FreeInk SDK</A> beside your firmware:
      </P>
      <CodeBlock lang="bash">{`git submodule add https://github.com/Free-Ink/freeink-sdk.git freeink-sdk
git submodule update --init --recursive`}</CodeBlock>

      <P>
        The starter uses <Code>FreeInkApp</Code> for screens/input routing, <Code>FreeInkUI</Code> for
        the list and reader chrome, <Code>FreeInkBook</Code> for EPUB parsing/layout, and{' '}
        <Code>SDCardManager</Code> for the card.
      </P>
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
  -DBOARD_HAS_PSRAM
  -DARDUINO_USB_CDC_ON_BOOT=1
  -DARDUINO_USB_MODE=1
lib_deps =
  BoardConfig=symlink://freeink-sdk/libs/hardware/BoardConfig
  EInkDisplay=symlink://freeink-sdk/libs/display/FreeInkDisplay
  InputManager=symlink://freeink-sdk/libs/hardware/InputManager
  BatteryMonitor=symlink://freeink-sdk/libs/hardware/BatteryMonitor
  SDCardManager=symlink://freeink-sdk/libs/hardware/SDCardManager
  FreeInkUI=symlink://freeink-sdk/libs/ui/FreeInkUI
  FreeInkBook=symlink://freeink-sdk/libs/book/FreeInkBook`}</CodeBlock>

      <H2>2. Minimal reader</H2>
      <P>
        Put EPUB files in <Code>/Books</Code> on the SD card. The home screen is a plain All Books list.
        Tap a row to open it. In the reader, tap left/right to turn pages. Swipe up from the very bottom
        edge to go home; swipe down from the very top edge to show the reader menu.
      </P>
      <CodeBlock lang="cpp">{`#include <Arduino.h>
#include <BookStorage.h>
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
#include <render/TtfFont.h>

using namespace freeink;

enum : ui::ActionId { ActionOpenBook = 1, ActionPagePrev, ActionPageNext };
enum class Screen : uint8_t { Books, Reader, Menu };

EInkDisplay display(
  BoardConfig::ACTIVE.display.sclk, BoardConfig::ACTIVE.display.mosi,
  BoardConfig::ACTIVE.display.cs,   BoardConfig::ACTIVE.display.dc,
  BoardConfig::ACTIVE.display.rst,  BoardConfig::ACTIVE.display.busy);

InputManager input;
using App = ui::FreeInkApp<32, 8>;
App* app = nullptr;

static constexpr uint8_t kMaxBooks = 64;

Screen screenId = Screen::Books;
ui::BitmapBookFont fallbackFont;
book::FontChain fonts;

char bookPaths[kMaxBooks][128];
char bookTitles[kMaxBooks][64];
ui::ListItem bookRows[kMaxBooks];
uint8_t bookCount = 0;
uint16_t bookTop = 0;
uint16_t bookVisibleRows = 0;
int16_t selectedBook = 0;

uint8_t* bookArenaBuf = nullptr;
uint8_t* scratchBuf = nullptr;
uint8_t* indexBuf = nullptr;

class SdBookSource : public book::BookSource {
 public:
  bool open(const char* path) {
    file_ = SdMan.open(path, O_RDONLY);
    size_ = file_ ? file_.fileSize() : 0;
    return file_ && size_ > 0;
  }
  void close() { if (file_) file_.close(); }
  int32_t readAt(uint64_t offset, void* dst, uint32_t len) override {
    if (!file_ || !file_.seekSet(offset)) return -1;
    return file_.read(dst, len);
  }
  uint64_t size() const override { return size_; }
 private:
  FsFile file_;
  uint64_t size_ = 0;
};

class SdPageCache : public book::CacheStorage {
 public:
  bool begin(const char* path, uint32_t hash) {
    snprintf(dir_, sizeof(dir_), "/BookCache/%08lx", static_cast<unsigned long>(hash));
    SdMan.ensureDirectoryExists("/BookCache");
    SdMan.ensureDirectoryExists(dir_);
    return true;
  }
  bool exists(const char* name) override { return SdMan.exists(fullPath(name)); }
  bool remove(const char* name) override { return SdMan.remove(fullPath(name)); }
  int64_t fileSize(const char* name) override {
    FsFile f = SdMan.open(fullPath(name), O_RDONLY);
    if (!f) return -1;
    const int64_t size = f.fileSize();
    f.close();
    return size;
  }
  int32_t readAt(const char* name, uint32_t off, void* dst, uint32_t len) override {
    FsFile f = SdMan.open(fullPath(name), O_RDONLY);
    if (!f || !f.seekSet(off)) return -1;
    const int32_t n = f.read(dst, len);
    f.close();
    return n;
  }
  bool beginWrite(const char* name) override {
    snprintf(commitPath_, sizeof(commitPath_), "%s/%s", dir_, name);
    write_ = SdMan.open(fullPath("_tmp.fibp"), O_WRONLY | O_CREAT | O_TRUNC);
    return static_cast<bool>(write_);
  }
  bool write(const void* data, uint32_t len) override {
    return write_ && write_.write(data, len) == len;
  }
  bool endWrite() override {
    if (!write_) return false;
    write_.close();
    SdMan.remove(commitPath_);
    return SdMan.rename(fullPath("_tmp.fibp"), commitPath_);
  }
 private:
  const char* fullPath(const char* name) {
    snprintf(pathBuf_, sizeof(pathBuf_), "%s/%s", dir_, name);
    return pathBuf_;
  }
  char dir_[64] = "";
  char pathBuf_[160] = "";
  char commitPath_[160] = "";
  FsFile write_;
};

struct Reader {
  SdBookSource source;
  SdPageCache cache;
  book::Book book;
  book::Reader reader;
  book::Arena bookArena;
  book::Arena scratch;
  book::Arena indexArena;
  book::LayoutParams params;
  uint16_t spine = 0;
  uint16_t page = 0;
  bool open = false;

  bool begin(const char* path) {
    end();
    bookArena.init(bookArenaBuf, 512 * 1024);
    scratch.init(scratchBuf, 512 * 1024);
    indexArena.init(indexBuf, 64 * 1024);
    if (!source.open(path)) return false;
    if (book.open(source, bookArena, scratch) != book::BookStatus::Ok) return false;

    params.font = &fonts;
    params.pageWidth = app->device().width - 48;
    params.pageHeight = app->device().height - 72;
    params.marginLeft = params.marginRight = 24;
    params.marginTop = params.marginBottom = 36;
    params.baseSizePx = 18;
    params.lineHeightPct = 140;

    const uint32_t hash = book::ZipCatalog::hashPath(path);
    cache.begin("chapter", hash);
    return openChapter(0);
  }

  bool openChapter(uint16_t nextSpine) {
    if (nextSpine >= book.spineCount()) return false;
    spine = nextSpine;
    page = 0;
    const book::ManifestItem* item = book.spineItem(spine);
    const book::ZipEntry* entry = item ? book.zip().find(item->href) : nullptr;
    if (!item || !entry) return false;

    book::PageCacheWriter writer;
    if (!writer.begin(cache, "chapter", book::ZipCatalog::hashPath(item->href), scratch)) return false;
    const book::BookStatus st = book::ChapterLayout::layout(
      source, book.zip(), *entry, item->href, params, scratch, writer);
    if (st != book::BookStatus::Ok || !writer.finish()) return false;
    indexArena.reset();
    open = reader.open(cache, "chapter", book::ZipCatalog::hashPath(item->href), indexArena);
    return open;
  }

  bool turn(int delta) {
    if (!open) return false;
    if (delta > 0 && page + 1 < reader.pageCount()) { ++page; return true; }
    if (delta > 0 && openChapter(spine + 1)) return true;
    if (delta < 0 && page > 0) { --page; return true; }
    if (delta < 0 && spine > 0 && openChapter(spine - 1)) {
      page = reader.pageCount() ? reader.pageCount() - 1 : 0;
      return true;
    }
    return false;
  }

  void render(book::FrameTarget& frame) {
    if (!open) return;
    const size_t mark = scratch.mark();
    book::Page p;
    if (reader.readPage(page, scratch, &p) == book::BookStatus::Ok) {
      book::PageRenderer::renderText(p, fonts, frame, nullptr);
      book::PageRenderer::renderImages(p, source, book.zip(), scratch, frame);
    }
    scratch.release(mark);
  }

  void end() {
    if (open) reader.close();
    source.close();
    open = false;
  }
} reader;

void booksScreen(App::ScreenType& s, void*);
void readerScreen(App::ScreenType& s, void*);
void menuScreen(App::ScreenType& s, void*);

void go(Screen next) {
  screenId = next;
  app->clearTapFlash();
  app->setScreen(
    next == Screen::Books ? booksScreen : next == Screen::Reader ? readerScreen : menuScreen,
    nullptr, ui::RefreshHint::None);
  app->invalidateTransition();
}

void scanBooks() {
  bookCount = 0;
  FsFile dir = SdMan.open("/Books");
  while (dir && bookCount < kMaxBooks) {
    FsFile f = dir.openNextFile();
    if (!f) break;
    if (!f.isDirectory()) {
      char name[64];
      f.getName(name, sizeof(name));
      const size_t n = strlen(name);
      if (n > 5 && strcasecmp(name + n - 5, ".epub") == 0) {
        snprintf(bookPaths[bookCount], sizeof(bookPaths[bookCount]), "/Books/%s", name);
        snprintf(bookTitles[bookCount], sizeof(bookTitles[bookCount]), "%.*s", static_cast<int>(n - 5), name);
        bookRows[bookCount].label = bookTitles[bookCount];
        bookRows[bookCount].actionValue = bookCount;
        ++bookCount;
      }
    }
    f.close();
  }
  if (dir) dir.close();
}

void booksScreen(App::ScreenType& s, void*) {
  s.header("All Books");
  ui::ListProps list;
  list.items = bookRows;
  list.count = bookCount;
  list.selectedIndex = selectedBook;
  list.topIndex = bookTop;
  list.action = ActionOpenBook;
  list.rowStyles = ui::selectedPlainListRowStyles();
  list.labelText = s.theme().bodyText;
  list.rowHeight = s.theme().rowHeight;
  list.scrollIndicator = true;
  bookVisibleRows = ui::listVisibleRows(s.body(), list.rowHeight, list.rowGap);
  ui::list(s.frame(), s.body().inset({0, 10, 0, 10}), list);
}

void readerScreen(App::ScreenType& s, void*) {
  ui::TapZonesProps taps;
  taps.prevAction = ActionPagePrev;
  taps.nextAction = ActionPageNext;
  taps.menuAction = ui::NO_ACTION;  // top-edge swipe opens the menu
  ui::tapZones(s.frame(), s.frame().safeRect(), taps);
}

void menuScreen(App::ScreenType& s, void*) {
  char progress[32];
  snprintf(progress, sizeof(progress), "Chapter %u", static_cast<unsigned>(reader.spine + 1));
  ui::StatusBarProps bar;
  bar.title = "Reader Menu";
  bar.subtitle = progress;
  s.status(bar);
  s.centeredText("Swipe up from the bottom edge to resume.");
}

void onOpenBook(const ui::ActionEvent& e, void*) {
  selectedBook = e.value;
  if (selectedBook >= 0 && selectedBook < bookCount && reader.begin(bookPaths[selectedBook])) {
    go(Screen::Reader);
  }
}

void onPageTurn(const ui::ActionEvent& e, void*) {
  if (reader.turn(e.action == ActionPageNext ? 1 : -1)) app->invalidate(ui::RefreshHint::Fast);
}

void setup() {
  BoardConfig::holdPowerRails();
  BoardConfig::releaseSdRail();
  delay(10);

  SdMan.begin();
  display.begin();
  input.begin();
  input.beginAsync(2, 10);
  bookArenaBuf = static_cast<uint8_t*>(ps_malloc(512 * 1024));
  scratchBuf = static_cast<uint8_t*>(ps_malloc(512 * 1024));
  indexBuf = static_cast<uint8_t*>(ps_malloc(64 * 1024));

  static ui::DisplayTarget displayTarget(display.getFrameBuffer(), display.getDisplayWidth(),
                                         display.getDisplayHeight(), display.getDisplayWidthBytes(),
                                         ui::Orientation::Portrait);
  static App application(displayTarget, displayTarget.deviceContext());
  app = &application;
  app->setClearColor(ui::Color::White);
  fonts.add(&fallbackFont);

  app->on(ActionOpenBook, onOpenBook);
  app->on(ActionPagePrev, onPageTurn);
  app->on(ActionPageNext, onPageTurn);

  scanBooks();
  app->setScreen(booksScreen, nullptr, ui::RefreshHint::Full);
}

void loop() {
  float sx0, sy0, sx1, sy1;
  while (input.popSwipe(sx0, sy0, sx1, sy1)) {
    const ui::Point a = ui::touchToLogical(app->device(), sx0, sy0);
    const ui::Point b = ui::touchToLogical(app->device(), sx1, sy1);
    const int16_t dy = static_cast<int16_t>(b.y - a.y);
    const int16_t dx = static_cast<int16_t>(b.x - a.x);
    const bool vertical = abs(dy) > abs(dx);
    if (screenId == Screen::Reader && vertical && a.y <= app->device().height * 14 / 100 && dy > 0) {
      go(Screen::Menu);
    } else if (screenId != Screen::Books && vertical && a.y >= app->device().height - 40 && dy < 0) {
      if (screenId == Screen::Menu) go(Screen::Reader);
      else { reader.end(); go(Screen::Books); }
    } else if (screenId == Screen::Books && vertical && bookVisibleRows > 0 && bookCount > bookVisibleRows) {
      const uint16_t maxTop = bookCount - bookVisibleRows;
      const uint16_t step = bookVisibleRows > 1 ? bookVisibleRows - 1 : 1;
      bookTop = dy < 0 ? min<uint16_t>(bookTop + step, maxTop) : (bookTop > step ? bookTop - step : 0);
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
    if (screenId == Screen::Reader && reader.open) {
      book::FrameTarget frame{display.getFrameBuffer(),
                              static_cast<int16_t>(display.getDisplayWidth()),
                              static_cast<int16_t>(display.getDisplayHeight()),
                              static_cast<int16_t>(display.getDisplayWidthBytes()),
                              book::FrameFormat::Mono1Dithered,
                              book::FrameRotation::Portrait};
      reader.render(frame);
    }
    const ui::RefreshHint hint = app->lastRenderRefreshHint();
    if (static_cast<uint8_t>(hint) > static_cast<uint8_t>(pending)) pending = hint;
  }
  if (pending != ui::RefreshHint::None && !display.refreshBusy()) {
    ui::presentAsync(display, pending);
    pending = ui::RefreshHint::None;
  }
}`}</CodeBlock>

      <H2>3. Gesture contract</H2>
      <P>
        Keep edge gestures strict. The starter only treats a bottom swipe as Home when the gesture starts
        in the bottom 40 logical pixels, so ordinary list scrolling does not exit the screen. The reader
        menu uses the mirror rule: the top swipe must start in the top 14% of the screen.
      </P>

      <H2>4. Where to grow from here</H2>
      <P>
        Add a progress file under <Code>/BookCache</Code>, cache metadata so the list can show EPUB titles
        and authors instead of filenames, add a TOC list to <Code>Screen::Menu</Code>, then add settings
        only after the reader loop feels right.
      </P>
    </>
  )
}
