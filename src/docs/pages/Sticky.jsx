import { Lead, P, H2, A, Ol, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Sticky() {
  return (
    <>
      <Lead>
        A hands-on walkthrough: build a complete <strong>reminder appliance</strong> on the{' '}
        <strong>Sticky</strong> — a touch reminder list with a delete dialog, on-screen-keyboard entry,
        a settings screen with Wi-Fi/NTP clock sync, a time-zone/clock adjuster, a 12/24-hour toggle,
        and a buzzer that goes off when a reminder is due. It exercises{' '}
        <A href="/docs/lib-ui">FreeInkUI</A>, the <A href="/docs/lib-rtc">RTC</A>,{' '}
        <A href="/docs/lib-buzzer">Buzzer</A> and <A href="/docs/lib-icons">Icons</A> together.
      </Lead>

      <Callout title="Prerequisites">
        <p>
          A PlatformIO install and a Sticky (Seeed) board —
          an <strong>ESP32-S3</strong> with an SSD1677 3.97″ 800×480 panel, GT911 touch, a PCF8563 RTC and
          a buzzer. See <A href="/docs/devices">Supported devices</A>.
        </p>
      </Callout>

      <H2>1. Project setup and build env</H2>
      <P>
        Vendor the <A href="https://github.com/Free-Ink/freeink-sdk">FreeInk SDK</A> into your project as
        a git submodule so the checkout travels with the repo:
      </P>
      <CodeBlock lang="bash">{`git submodule add https://github.com/Free-Ink/freeink-sdk.git freeink-sdk
git submodule update --init --recursive   # --recursive: the SDK nests the lucide icon set
# collaborators: git clone --recurse-submodules`}</CodeBlock>
      <P>
        <Code>-DFREEINK_DEVICE_STICKY=1</Code> pulls in the SSD1677 driver and the Sticky profile (touch,
        RTC and buzzer default on). Add the libraries the app touches — the Icons lib provides the{' '}
        <Code>Icon.h</Code> the generated header includes, and Wi-Fi is built into the Arduino-ESP32
        core:
      </P>
      <CodeBlock lang="platformio.ini">{`[env:sticky]
extends = base
board = esp32-s3-devkitc1-n16r8
board_build.mcu = esp32s3
build_flags =
  \${base.build_flags}
  -DFREEINK_DEVICE_STICKY=1
lib_deps =
  \${base.lib_deps}   ; BoardConfig, EInkDisplay, InputManager, FreeInkUI
  Rtc=symlink://freeink-sdk/libs/hardware/Rtc
  Buzzer=symlink://freeink-sdk/libs/hardware/Buzzer
  Icons=symlink://freeink-sdk/libs/assets/Icons`}</CodeBlock>

      <H2>2. Generate the icons</H2>
      <P>
        The <A href="/docs/lib-icons">Icons</A> tool bakes only the glyphs you use into a header. List
        them in a manifest and run the generator to get a <Code>generated_icons.h</Code> with a{' '}
        <Code>freeink::Icon</Code> per icon per size:
      </P>
      <CodeBlock>{`# icons.txt
bell       = bell
clock      = clock
wifi       = wifi
plus       = plus
settings   = settings
arrow-left = arrow-left
globe      = globe

python freeink-sdk/libs/assets/Icons/tools/gen_icons.py \\
    --manifest icons.txt \\
    --svgdir   freeink-sdk/libs/assets/Icons/lucide/icons \\
    --sizes    24 \\
    --out      src/generated_icons.h`}</CodeBlock>
      <P>
        The same idea works for text: every <Code>DisplayTarget</Code> font slot defaults to the bundled
        34px-line Noto Sans, and <Code>gen_font.py</Code> rasterizes any TTF into another slot. The
        settings screen uses a larger anti-aliased variant for its row labels:
      </P>
      <CodeBlock>{`python freeink-sdk/libs/ui/FreeInkUI/tools/gen_font.py \\
    --ttf NotoSans-Regular.ttf --size 32 --alpha \\
    --name NotoSansLarge --out src/generated_font_large.h`}</CodeBlock>

      <H2>3. Boot and the app shell</H2>
      <P>
        Construct the display and input from the board profile and drive them with{' '}
        <Code>FreeInkApp</Code>. Two boot rules on the Sticky: assert the battery power latch first
        (<Code>BoardConfig::holdPowerRails()</Code>), and rescue the SD power rail before touching the
        display (<Code>BoardConfig::releaseSdRail()</Code> — see the callout below). One trap:{' '}
        <Code>FreeInkDisplay</Code> only allocates its framebuffer in <Code>begin()</Code>, so{' '}
        <Code>getFrameBuffer()</Code> returns <Code>nullptr</Code> at static-init time — building the{' '}
        <Code>DisplayTarget</Code> as a global crashes the first render (<Code>LoadProhibited</Code>{' '}
        boot loop). Keep an <Code>App*</Code> global, or other global pointer, and construct the target
        and app in <Code>setup()</Code>, after <Code>display.begin()</Code>. <Code>FreeInkApp</Code>{' '}
        sizes its theme to the target's actual font line height, and <Code>setClearColor()</Code> starts
        every paint from a white canvas — frames don't clear the target on their own. One{' '}
        <Code>setTheme()</Code> tweak swaps the default filled buttons for outlined rounded ones
        app-wide, so no button needs per-call styling later.
      </P>
      <CodeBlock lang="cpp">{`#include <EInkDisplay.h>
#include <BoardConfig.h>
#include <InputManager.h>
#include <FreeInkApp.h>
#include <FreeInkUIDisplayTarget.h>
#include <FreeInkUIInputManager.h>
#include <Rtc.h>
#include <Buzzer.h>
#include <WiFi.h>
#include <time.h>
#include "generated_icons.h"
#include "generated_font_large.h"   // 32px Noto Sans for the settings labels

using namespace freeink;

EInkDisplay display(
  BoardConfig::ACTIVE.display.sclk, BoardConfig::ACTIVE.display.mosi,
  BoardConfig::ACTIVE.display.cs,   BoardConfig::ACTIVE.display.dc,
  BoardConfig::ACTIVE.display.rst,  BoardConfig::ACTIVE.display.busy);

InputManager input;
Rtc          rtc;
Buzzer       buzzer;

// The framebuffer doesn't exist until display.begin(), so the DisplayTarget
// and App are constructed in setup() — not here at static init.
using App = ui::FreeInkApp<64, 24>;   // 64 interactions/frame, 24 action handlers
App* app = nullptr;

constexpr ui::FontId kFontLarge = 1;  // DisplayTarget slot for the generated font

static ui::BitmapRef iconRef(const Icon& i) {   // 1-bit mask (bit 1 = transparent)
  return { i.bits, i.w, i.h, ui::BitmapFormat::Mask1, /*progmem=*/true };
}

void setup() {
  BoardConfig::holdPowerRails();   // battery latch (Sticky PWR_HOLD / PWR_LOCK)
  BoardConfig::releaseSdRail();    // SD shares the display SPI bus — see callout
  delay(10);

  display.begin();  input.begin();  rtc.begin();  buzzer.begin();

  // Poll input on its own task: taps land in a queue (popTouchTap) no matter
  // how long a render or panel refresh keeps loop() busy — the fix for
  // dropped keystrokes. loop() must not call input.update() anymore.
  input.beginAsync(/*taskPriority=*/2, /*pollMs=*/10);

  // Now the framebuffer exists — build the UI on top of it.
  static ui::DisplayTarget target(display.getFrameBuffer(), display.getDisplayWidth(),
                                  display.getDisplayHeight(), display.getDisplayWidthBytes());
  target.setFont(kFontLarge, ui::kNotoSansLargeFont);   // slot 1: settings labels
  static App appInstance(target, target.deviceContext());
  app = &appInstance;

  // One theme tweak: outlined rounded buttons everywhere (nav back button,
  // footers, action bar). Every button inherits it — no per-call styling.
  ui::ThemeTokens theme = app->theme();
  theme.button = ui::outlinedButtonStyles(10);
  app->setTheme(theme);

  app->setClearColor(ui::Color::White);
  app->setScreen(appScreen, &state);
  // ... register the action handlers (section 5)
}`}</CodeBlock>

      <Callout tone="warn" title="Blank panel? Check the shared SD bus">
        <p>
          On the Sticky the MicroSD sits on the <em>same SPI bus</em> as the panel, and a rail latched
          off with <Code>gpio_hold</Code> by a previous firmware's sleep path <strong>survives reset and
          reflashing</strong>. An unpowered card clamps the shared lines and the display goes completely
          dead — firmware runs, panel never updates. <Code>BoardConfig::releaseSdRail()</Code> releases
          the hold, powers the card and deselects it; <A href="/docs/lib-sd">SDCardManager</A>'s{' '}
          <Code>begin()</Code> does the same if your app mounts the card anyway.
        </p>
      </Callout>

      <H2>4. State and screens</H2>
      <P>
        One <Code>ScreenId</Code> enum switches a single render function between the home list, the
        keyboard entry, settings, the clock adjuster and the two Wi-Fi views. The keyboard's editing
        state (shift/symbol layers, UTF-8 append, multi-byte backspace) lives in the SDK's{' '}
        <Code>ui::KeyboardEntry</Code> — <Code>attach()</Code> binds whichever buffer the current screen
        edits. Sub-screens share consistent chrome via <Code>screen.navHeader()</Code>: a top-left back
        button, a centered title, and an optional right label — Settings puts the live clock there,
        matching the home status bar. A three-line wrapper saves repeating the back action and icon on
        every screen.
      </P>
      <CodeBlock lang="cpp">{`enum : ui::ActionId {
  ActionNew = 1, ActionOpen, ActionDelete, ActionDismiss,
  ActionKey, ActionShift, ActionMode, ActionBackspace, ActionSave, ActionLead,
  ActionOpenSettings, ActionToggleSound, ActionClockFmt, ActionOpenTz, ActionTz,
  ActionOpenWifi, ActionRescan, ActionPickNet, ActionConnect, ActionBack
};
enum ScreenId { ScreenHome, ScreenNew, ScreenSettings, ScreenTz, ScreenWifiScan, ScreenWifiPass };

constexpr uint8_t kMaxReminders = 12;
constexpr uint8_t kMaxNets      = 12;

struct Reminder { char text[40]; uint16_t dueMin; bool fired; };
struct AppState {
  ScreenId      screen = ScreenHome;
  Rtc::DateTime now{};
  bool          haveTime = false;
  Reminder      items[kMaxReminders];
  uint8_t       count = 0;
  int16_t       selected = -1;
  int16_t       dialogFor = -1;      // reminder index in the delete dialog
  bool          soundOn = true;
  bool          use24h = true;
  char          draft[40] = "";
  int16_t       leadMin = 15;
  int16_t       tzMin = 0;           // UTC offset in minutes
  char          nets[kMaxNets][33];  uint8_t netCount = 0;
  bool          scanPending = false; // scan runs after "Scanning..." is on the panel
  char          ssid[33] = "";
  char          pass[64] = "";
  const char*   wifiStatus = "";
  ui::KeyboardEntry kb;              // SDK-owned keyboard editing state
} state;

// Switch screens. invalidateTransition() keeps transitions on FAST partial
// refreshes (a FULL is a 1-2s stall) with a periodic FULL to clear ghosting.
static void gotoScreen(AppState& s, ScreenId id) {
  s.screen = id;
  if (app) {
    app->invalidateTransition();
    app->clearTapFlash();  // the tapped element doesn't exist on the next screen
  }
}

// Sub-screen chrome: back button + centered title + optional right label,
// without the SDK's default bottom rule (borderEdges is HeaderProps' divider
// setting: EdgeBottom draws it, EdgesNone drops it). An action/enabled pair
// puts a trailing button (Save) on the right edge instead of the label.
static void navHeader(App::ScreenType& screen, const char* title, const char* rightLabel = nullptr,
                      const char* actionLabel = nullptr, ui::ActionId action = ui::NO_ACTION,
                      bool actionEnabled = true) {
  screen.navHeader(title, ActionBack, iconRef(icon_arrow_left_24), rightLabel, ui::EdgesNone,
                   actionLabel, action, actionEnabled);
}`}</CodeBlock>
      <P>
        The render function builds whichever screen is active. Two representative screens — the keyboard
        entry (header with a trailing Save, keyboard, lead-time stepper, text area) and home (status-bar clock,
        the reminder list with due times and countdowns, a bottom action bar, and the delete dialog as a
        modal overlay):
      </P>
      <CodeBlock lang="cpp">{`void appScreen(App::ScreenType& screen, void* user) {
  auto& s = *static_cast<AppState*>(user);
  const auto& theme = screen.theme();
  const bool modal = s.dialogFor >= 0;

  if (s.screen == ScreenNew) {
    // Save lives in the header's trailing slot, mirroring the back button.
    navHeader(screen, "New reminder", nullptr, "Save", ActionSave, !s.kb.empty());
    ui::QwertyKeyboardProps keys;
    keys.keyAction = ActionKey;  keys.shiftAction = ActionShift;
    keys.modeAction = ActionMode;
    keys.deleteAction = ActionBackspace;  keys.okAction = ActionSave;
    ui::applyEntry(keys, s.kb);           // shift/symbol layers from KeyboardEntry
    screen.qwertyKeyboard(keys, 260, ui::LayoutAnchor::Bottom);

    char leadStr[12];
    std::snprintf(leadStr, sizeof leadStr, "%d min", s.leadMin);
    ui::StepperRowProps step;
    step.row.label = "Remind in";  step.value = leadStr;
    step.increment = ActionLead;   step.incrementValue = 5;
    step.decrement = ActionLead;   step.decrementValue = -5;
    step.widestValue = "240 min";  // keeps the value slot from shifting
    screen.stepperRow(step, ui::LayoutAnchor::Bottom);

    screen.insetContent({8, 12, 8, 12});
    ui::TextAreaProps body;
    body.text = s.draft;  body.cursor = static_cast<int16_t>(s.kb.length());
    body.showCaret = true;
    screen.textArea(body);
    return;
  }

  // ... ScreenSettings: navHeader(screen, "Settings", clock); roomy setting
  //     rows — large-font labels (font slot 1) and taller rows via
  //     screen.settingRow(props, rowH); the SDK's slot layout aligns the icon
  //     and the right-side value/switch to the label's title band, so the
  //     subtitle spans the full width beneath. Toggle rows use hitToggleOnly
  //     (a deliberate tap on the switch toggles, not anywhere on the row).
  // ... ScreenTz: large live clock between -/+ stepper buttons, 15 min per tap.
  // ... ScreenWifiScan: network list, or screen.centeredText("Scanning...").
  // ... ScreenWifiPass: keyboard bound to the password buffer; Connect in the
  //     header's trailing slot, like Save (enabled even with an empty
  //     password — open networks).

  // ---- Home ----------------------------------------------------------------
  char clock[12];
  formatClock(s, clock, sizeof clock);   // honors the 12/24-hour setting
  ui::StatusBarProps sb;
  sb.title = "Reminders";  sb.trailing = clock;  sb.leadingIcon = iconRef(icon_bell_24);
  screen.status(sb);

  // Bottom action bar: left-aligned New button + square settings button.
  // While the delete dialog is up the bar isn't drawn at all — a dithered
  // "dim" can't hide 1-bit content, so ghost buttons under a modal read as a
  // bug. The band is still consumed so the list doesn't shift.
  ui::Rect band = screen.takeBottom(static_cast<int16_t>(theme.rowHeight + 16), theme.spaceSm);
  if (!modal) {
    band = band.inset({4, 12, 4, 12});
    ui::Rect gearRect{static_cast<int16_t>(band.right() - band.height), band.y,
                      band.height, band.height};
    ui::ButtonProps gear;
    gear.icon = iconRef(icon_settings_24);  gear.action = ActionOpenSettings;
    screen.button(gear, gearRect);   // themed at an explicit rect — outlined via setTheme()
    // ... "New reminder" button fills the bar up to the gear (same pattern).
  }

  if (s.count == 0) {
    screen.centeredText("Nothing scheduled");
    return;
  }

  // The list, with due time and countdown per row.
  static char values[kMaxReminders][12], subs[kMaxReminders][20];
  const uint16_t nowMin = s.now.hour * 60 + s.now.minute;
  ui::ListItem rows[kMaxReminders];
  for (uint8_t i = 0; i < s.count; ++i) {
    formatMin(s.use24h, s.items[i].dueMin, values[i], sizeof values[i]);
    if (s.items[i].fired) std::snprintf(subs[i], sizeof subs[i], "done");
    else std::snprintf(subs[i], sizeof subs[i], "in %u min",
                       (s.items[i].dueMin + 1440 - nowMin) % 1440);
    rows[i].label = s.items[i].text;  rows[i].subtitle = subs[i];  rows[i].value = values[i];
    rows[i].actionValue = i;
    rows[i].icon = iconRef(s.items[i].fired ? icon_bell_24 : icon_clock_24);
  }
  screen.insetContent({4, 12, 0, 12});
  screen.list(rows, s.count, s.selected, modal ? ui::NO_ACTION : ActionOpen);

  if (modal) {   // tapping a row opens a delete dialog over the list
    static const ui::DialogOption opts[] = {
      { .label = "Delete", .action = ActionDelete },
      { .label = "Cancel", .action = ActionDismiss },
    };
    ui::OptionDialogProps dlg;
    dlg.title = "Reminder";
    dlg.headline = s.items[s.dialogFor].text;
    dlg.message = "Remove this reminder?";
    dlg.options = opts;  dlg.optionCount = 2;
    dlg.dimBackground = true;
    screen.dialog(dlg);
  }
}`}</CodeBlock>

      <H2>5. Actions and the loop</H2>
      <P>
        Handlers stay tiny: the four keyboard actions route straight into <Code>KeyboardEntry</Code>,
        the clock adjuster uses <Code>Rtc::adjust()</Code> (calendar-correct across midnight, works
        before any NTP sync — dialing the clock by hand is a legitimate way to set it), and the Wi-Fi
        scan is deferred with a <Code>scanPending</Code> flag so the "Scanning..." screen reaches the
        panel before the 2-4s blocking scan runs. <Code>Connect</Code> joins with the typed password,
        pulls the time over NTP with the configured UTC offset, and writes it into the RTC so the clock
        survives reboots.
      </P>
      <CodeBlock lang="cpp">{`  // The keyboard: KeyboardEntry owns append/backspace and the layer flags.
  app->on(ActionKey, [](const ui::ActionEvent& e, void* u){
    static_cast<AppState*>(u)->kb.key(e.value); }, &state);
  app->on(ActionBackspace, [](const ui::ActionEvent&, void* u){
    static_cast<AppState*>(u)->kb.backspace(); }, &state);
  app->on(ActionShift, [](const ui::ActionEvent&, void* u){
    static_cast<AppState*>(u)->kb.shift(); }, &state);
  app->on(ActionMode, [](const ui::ActionEvent&, void* u){
    static_cast<AppState*>(u)->kb.mode(); }, &state);

  app->on(ActionNew, [](const ui::ActionEvent&, void* u){
    auto& s = *static_cast<AppState*>(u);
    gotoScreen(s, ScreenNew); s.draft[0] = 0;
    s.kb.attach(s.draft, sizeof s.draft, /*startShifted=*/true); }, &state);

  // Clock adjuster: -/+ stepper buttons send 15-minute deltas, wrapping at the
  // UTC-12..UTC+14 ends.
  app->on(ActionTz, [](const ui::ActionEvent& e, void* u){
    auto& s = *static_cast<AppState*>(u);
    int16_t next = s.tzMin + e.value;
    if (next > 840)  next = -720;
    if (next < -720) next = 840;
    const int16_t delta = next - s.tzMin;
    s.tzMin = next;
    if (delta && rtc.adjust(delta * 60L, &s.now)) s.haveTime = true;
  }, &state);

  // Wi-Fi: show "Scanning..." first, scan after that frame is on the panel.
  app->on(ActionOpenWifi, [](const ui::ActionEvent&, void* u){
    auto& s = *static_cast<AppState*>(u);
    s.netCount = 0; s.scanPending = true; s.wifiStatus = "";
    gotoScreen(s, ScreenWifiScan); }, &state);

void loop() {
  static uint32_t lastTick = 0;
  static uint16_t lastMinute = 0xFFFF;
  if (millis() - lastTick > 1000) {                 // read the RTC ~1 Hz
    lastTick = millis();
    if (rtc.now(state.now)) {                       // false until the clock is set
      state.haveTime = true;
      uint16_t nowMin = state.now.hour * 60 + state.now.minute;
      for (uint8_t i = 0; i < state.count; ++i) {
        if (!state.items[i].fired && nowMin == state.items[i].dueMin) {
          if (state.soundOn) buzzer.tone(2000, 400); // alert!
          state.items[i].fired = true;
          app->invalidate(ui::RefreshHint::Fast);
        }
      }
      if (nowMin != lastMinute) { lastMinute = nowMin; app->invalidate(ui::RefreshHint::Fast); }
    }
  }

  // Taps are sampled on the input task (beginAsync in setup) and queued —
  // nothing is lost while this thread renders or the panel refreshes. route()
  // dispatches each tap against the last rendered frame without drawing
  // (microseconds), so a fast typing burst costs one repaint, not one 200ms
  // render per key.
  float nx, ny;
  while (input.popTouchTap(nx, ny)) {
    ui::InputSnapshot tap;
    const ui::Point p = ui::touchToLogical(app->device(), nx, ny);
    tap.touchReleased = true;
    tap.touchX = p.x;
    tap.touchY = p.y;
    app->route(tap);
  }

  static ui::RefreshHint pending = ui::RefreshHint::None;
  if (app->invalidated()) {
    app->render();
    const ui::RefreshHint hint = app->lastRenderRefreshHint();
    if (static_cast<uint8_t>(hint) > static_cast<uint8_t>(pending)) pending = hint;
  }

  // Push the newest frame whenever the panel is idle. Under fast typing the
  // refreshes chain back-to-back — each one shows every keystroke that landed
  // while the previous refresh ran (the ~0.6s fast waveform is the pace) —
  // and stop when nothing is dirty.
  if (pending != ui::RefreshHint::None && !display.refreshBusy()) {
    ui::presentAsync(display, pending);
    pending = ui::RefreshHint::None;

    // The "Scanning..." frame is on its way to the panel; run the blocking
    // Wi-Fi scan while the refresh runs.
    if (state.scanPending && state.screen == ScreenWifiScan) {
      state.scanPending = false;
      scanNets(state);
      app->invalidate(ui::RefreshHint::Fast);
    }
  }
  delay(10);
}`}</CodeBlock>

      <Callout tone="warn" title="Never block the loop — on the panel or on input">
        <p>
          Two things make e-paper typing feel broken: blocking on the panel and sampling input on the
          render thread. A blocking <Code>ui::present()</Code> spins on the BUSY pin for the whole
          waveform (~0.3–2 s), and a render pass costs ~200 ms — during either, taps vanish.{' '}
          <Code>InputManager::beginAsync()</Code> samples touch on its own task and queues every
          completed tap (<Code>popTouchTap</Code>), so nothing is ever lost;{' '}
          <Code>app-&gt;route()</Code> dispatches queued taps against the last rendered frame without
          drawing, so a typing burst costs one repaint. <Code>ui::presentAsync()</Code> starts the
          refresh and returns in ~25 ms — the panel refreshes from its own RAM copy; poll{' '}
          <Code>display.refreshBusy()</Code> and push the newest frame when idle. Refresh only on
          change (accumulate the strongest <Code>RefreshHint</Code>), and use{' '}
          <Code>invalidateTransition()</Code> for screen changes (fast partials with a periodic full to
          clear ghosting).
        </p>
      </Callout>

      <H2>6. Build and flash</H2>
      <CodeBlock lang="bash">{`pio run -e sticky -t upload`}</CodeBlock>
      <P>
        Open <strong>Settings</strong> from the gear, tap <strong>Wi-Fi & clock</strong> to scan, pick
        your network, type the password and <strong>Connect</strong> to sync the clock — or dial the
        time by hand in <strong>Adjust clock</strong>. Back on the list, add a reminder with{' '}
        <strong>New</strong>; when its minute arrives the buzzer sounds and the row flips from clock to
        bell. The full firmware lives in the{' '}
        <A href="https://github.com/Free-Ink/sticky-reminders">sticky-reminders</A> repo.
      </P>

      <H2>Going further</H2>
      <Ol>
        <Li>
          Persist reminders, the Wi-Fi network and the UTC offset across reboots with{' '}
          <A href="/docs/lib-sd">SDCardManager</A>, and reload them in <Code>setup()</Code>.
        </Li>
        <Li>
          Localize the keyboard via <Code>QwertyKeyboardProps.layout</Code>, or design richer screens in
          the <A href="/docs/lib-ui">visual builder</A> and browse the{' '}
          <A href="/docs/lib-ui-components">component gallery</A>.
        </Li>
        <Li>
          Sleep between checks: arm a timer/touch wake and call{' '}
          <A href="/docs/lib-power">PowerManager</A>'s <Code>powerDownRailsForSleep()</Code> before{' '}
          <Code>deepSleep()</Code> to cut standby drain.
        </Li>
      </Ol>
    </>
  )
}
