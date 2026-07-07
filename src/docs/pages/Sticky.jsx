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
  \${base.lib_deps}   ; BoardConfig, EInkDisplay, InputManager, FreeInkUI, …
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
        every paint from a white canvas — frames don't clear the target on their own.
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

static ui::BitmapRef iconRef(const Icon& i) {   // 1-bit mask (bit 1 = transparent)
  return { i.bits, i.w, i.h, ui::BitmapFormat::Mask1, /*progmem=*/true };
}

void setup() {
  BoardConfig::holdPowerRails();   // battery latch (Sticky PWR_HOLD / PWR_LOCK)
  BoardConfig::releaseSdRail();    // SD shares the display SPI bus — see callout
  delay(10);

  display.begin();  input.begin();  rtc.begin();  buzzer.begin();

  // Now the framebuffer exists — build the UI on top of it.
  static ui::DisplayTarget target(display.getFrameBuffer(), display.getDisplayWidth(),
                                  display.getDisplayHeight(), display.getDisplayWidthBytes());
  static App appInstance(target, target.deviceContext());
  app = &appInstance;
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
        button with a centered title.
      </P>
      <CodeBlock lang="cpp">{`enum : ui::ActionId {
  ActionNew = 1, ActionOpen, ActionDelete, ActionDismiss,
  ActionKey, ActionShift, ActionMode, ActionBackspace, ActionSave, ActionLead,
  ActionOpenSettings, ActionToggleSound, ActionClockFmt, ActionOpenTz, ActionTz,
  ActionOpenWifi, ActionRescan, ActionPickNet, ActionConnect, ActionBack
};
enum ScreenId { ScreenHome, ScreenNew, ScreenSettings, ScreenTz, ScreenWifiScan, ScreenWifiPass };

struct Reminder { char text[40]; uint16_t dueMin; bool fired; };
struct AppState {
  ScreenId      screen = ScreenHome;
  Rtc::DateTime now{};
  bool          haveTime = false;
  Reminder      items[12];
  uint8_t       count = 0;
  int16_t       selected = -1;
  int16_t       dialogFor = -1;      // reminder index in the delete dialog
  bool          soundOn = true;
  bool          use24h = true;
  char          draft[40] = "";
  int16_t       leadMin = 15;
  int16_t       tzMin = 0;           // UTC offset in minutes
  char          nets[12][33];  uint8_t netCount = 0;
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

static void navHeader(App::ScreenType& screen, const char* title) {
  ui::HeaderProps props;
  props.title = title;
  props.centered = true;
  props.borderEdges = ui::EdgeBottom;
  props.leadingIcon = iconRef(icon_arrow_left_24);
  props.leadingAction = ActionBack;
  props.leadingStyles = ui::outlinedButtonStyles(10);
  props.leadingRadius = 8;
  screen.header(props);
}`}</CodeBlock>
      <P>
        The render function builds whichever screen is active. Two representative screens — the keyboard
        entry (header, keyboard, save row, lead-time stepper, text area) and home (status-bar clock,
        the reminder list with due times and countdowns, a bottom action bar, and the delete dialog as a
        modal overlay):
      </P>
      <CodeBlock lang="cpp">{`void appScreen(App::ScreenType& screen, void* user) {
  auto& s = *static_cast<AppState*>(user);
  const auto& theme = screen.theme();
  const bool modal = s.dialogFor >= 0;

  if (s.screen == ScreenNew) {
    navHeader(screen, "New reminder");
    ui::QwertyKeyboardProps keys;
    keys.keyAction = ActionKey;  keys.shiftAction = ActionShift;
    keys.modeAction = ActionMode;
    keys.deleteAction = ActionBackspace;  keys.okAction = ActionSave;
    ui::applyEntry(keys, s.kb);           // shift/symbol layers from KeyboardEntry
    screen.qwertyKeyboard(keys, 260, ui::LayoutAnchor::Bottom);

    const ui::FooterAction footer[] = {
      { .label = "Save", .action = ActionSave, .enabled = !s.kb.empty() },
    };
    screen.footer(footer, 1);

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

  // ... ScreenSettings: settingRows (Wi-Fi & clock, 12/24h clock toggle,
  //     clock adjuster, buzzer toggleRow) — see the repo for the full file.
  // ... ScreenTz: live clock + stacked +1h/+15min/-15min/-1h buttons.
  // ... ScreenWifiScan: network list, or screen.centeredText("Scanning...").
  // ... ScreenWifiPass: keyboard bound to the password buffer.

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
    gear.styles = ui::outlinedButtonStyles(10);  gear.radius = 10;
    gear.minTouchSize = theme.minTouchSize;
    ui::button(screen.frame(), gearRect, gear);
    // ... "New reminder" button fills the bar up to the gear (same pattern).
  }

  // The list, with due time and countdown per row.
  static char labels[12][44], values[12][12], subs[12][20];
  const uint16_t nowMin = s.now.hour * 60 + s.now.minute;
  ui::ListItem rows[12];
  for (uint8_t i = 0; i < s.count; ++i) {
    std::snprintf(labels[i], sizeof labels[i], "%s", s.items[i].text);
    formatMin(s.use24h, s.items[i].dueMin, values[i], sizeof values[i]);
    if (s.items[i].fired) std::snprintf(subs[i], sizeof subs[i], "done");
    else std::snprintf(subs[i], sizeof subs[i], "in %u min",
                       (s.items[i].dueMin + 1440 - nowMin) % 1440);
    rows[i].label = labels[i];  rows[i].subtitle = subs[i];  rows[i].value = values[i];
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

  // Clock adjuster: +-15min/+-1h buttons, wrapping at the UTC-12..UTC+14 ends.
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
  input.update();

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

  ui::InputSnapshot snap = ui::snapshotFrom(input, app->device());

  // Render on demand, not every loop: a full repaint costs real CPU time (the
  // keyboard is ~40 per-pixel rounded fills), and rendering unconditionally
  // starves the touch poll. Idle loops just poll input at full cadence.
  const bool inputActive = snap.touchPressed || snap.touchReleased || snap.confirm ||
                           snap.back || snap.focusNext || snap.focusPrev ||
                           snap.prev || snap.next;

  // Keystroke coalescing: a panel refresh blocks ~half a second and any tap
  // completed inside it is lost, so refreshing per keystroke drops letters
  // under fast typing. While text-entry actions keep arriving, keep capturing
  // taps and hold the refresh; push one refresh when the typing pauses.
  static uint32_t typeHoldUntil = 0;
  const bool holdActive = typeHoldUntil != 0 && millis() < typeHoldUntil;

  if (inputActive || (app->invalidated() && !holdActive)) {
    app->render(snap);

    const ui::ActionEvent ev = app->lastEvent();
    const bool kbScreen = state.screen == ScreenNew || state.screen == ScreenWifiPass;
    if (ev && kbScreen && (ev.action == ActionKey || ev.action == ActionBackspace ||
                           ev.action == ActionShift || ev.action == ActionMode)) {
      typeHoldUntil = millis() + 250;   // batch this burst into one refresh
    } else if (ev) {
      typeHoldUntil = 0;                // any other action refreshes immediately
    }

    if (typeHoldUntil == 0 || millis() >= typeHoldUntil) {
      typeHoldUntil = 0;
      ui::present(display, app->lastRenderRefreshHint());

      // A frame was just pushed; if it was the "Scanning..." screen, run the
      // blocking Wi-Fi scan now that the user can see why we're busy.
      if (state.scanPending && state.screen == ScreenWifiScan &&
          app->lastRenderRefreshHint() != ui::RefreshHint::None) {
        state.scanPending = false;
        scanNets(state);
        app->invalidate(ui::RefreshHint::Fast);
      }
    }
  }
  delay(10);
}`}</CodeBlock>

      <Callout tone="warn" title="Refresh only on change — and coalesce typing">
        <p>
          <Code>FreeInkApp</Code> reports whether the frame changed via <Code>RefreshHint</Code> and{' '}
          <Code>ui::present()</Code> pushes the panel only when it did. Screen changes use{' '}
          <Code>invalidateTransition()</Code> — fast partial refreshes with a periodic full to clear
          ghosting — and tap feedback is free: the tapped element paints its focused (gray) style in the
          same refresh that shows the tap's result. Never render or refresh every loop, and never
          refresh per keystroke: a refresh is a ~half-second blind window for touch, so batch typing
          bursts into one refresh as above or fast typing drops letters.
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
