import { Lead, P, H2, A, Ol, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Quickstart() {
  return (
    <>
      <Lead>
        Get an e-paper panel drawing with FreeInk. This walks through a minimal PlatformIO project for
        a single device; for the full configuration with every device env, see{' '}
        <A href="/docs/installation">PlatformIO setup</A>.
      </Lead>

      <Callout title="Prerequisites">
        <p>
          A PlatformIO install (CLI or the VS Code extension), a checkout of the{' '}
          <A href="https://github.com/Free-Ink/freeink-sdk">FreeInk SDK</A>, and a supported board —
          this example targets the <strong>Xteink X4</strong> (ESP32-C3, SSD1677).
        </p>
      </Callout>

      <H2>1. Add the libraries</H2>
      <P>
        FreeInk libraries are linked as <Code>symlink</Code> <Code>lib_deps</Code> pointing at your SDK
        checkout. The names match the original SDK so existing includes keep working:
      </P>
      <CodeBlock lang="platformio.ini">{`[env:xteink_x4]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino
build_flags = -DFREEINK_DEVICE_X4
lib_deps =
  BoardConfig=symlink://path/to/freeink-sdk/libs/hardware/BoardConfig
  EInkDisplay=symlink://path/to/freeink-sdk/libs/display/FreeInkDisplay
  InputManager=symlink://path/to/freeink-sdk/libs/hardware/InputManager
  BatteryMonitor=symlink://path/to/freeink-sdk/libs/hardware/BatteryMonitor
  SDCardManager=symlink://path/to/freeink-sdk/libs/hardware/SDCardManager`}</CodeBlock>
      <P>
        The display libs depend on <Code>BoardConfig</Code>; <Code>SdFat</Code> is pulled in
        automatically as a dependency of <Code>SDCardManager</Code>.
      </P>

      <H2>2. Initialize the display</H2>
      <P>
        The firmware constructs <Code>EInkDisplay</Code> from the active board profile and calls{' '}
        <Code>begin()</Code>, which selects the right panel driver. GPIOs come from{' '}
        <Code>BoardConfig::ACTIVE</Code> — nothing is hardcoded.
      </P>
      <CodeBlock lang="cpp">{`#include <EInkDisplay.h>
#include <BoardConfig.h>

using namespace freeink;

// Pins, geometry and controller all come from the active board profile —
// the constructor takes the display SPI pins (sclk, mosi, cs, dc, rst, busy).
EInkDisplay display(
  BoardConfig::ACTIVE.display.sclk,
  BoardConfig::ACTIVE.display.mosi,
  BoardConfig::ACTIVE.display.cs,
  BoardConfig::ACTIVE.display.dc,
  BoardConfig::ACTIVE.display.rst,
  BoardConfig::ACTIVE.display.busy
);

void setup() {
  display.begin();                          // selects the SSD1677 driver for the X4

  display.clearScreen(0xFF);                // white
  // draw a 1-bpp bitmap into the framebuffer:
  // display.drawImage(logo, x, y, w, h, /*fromProgmem=*/true);
  display.displayBuffer(FULL_REFRESH);      // FULL_REFRESH / HALF_REFRESH / FAST_REFRESH
}

void loop() {}`}</CodeBlock>

      <Callout tone="warn" title="Text rendering lives above the SDK">
        <p>
          FreeInk draws bitmaps into the framebuffer (<Code>clearScreen</Code>, <Code>drawImage</Code>)
          and pushes them with <Code>displayBuffer</Code>; fonts and text layout are the firmware's job.
          The shape to remember: construct from the board profile, <Code>begin()</Code>, draw into the
          framebuffer, then <Code>displayBuffer()</Code> with a refresh mode. See the{' '}
          <A href="/docs/lib-display">EInkDisplay reference</A> for the full surface.
        </p>
      </Callout>

      <H2>3. Build and flash</H2>
      <CodeBlock lang="bash">{`pio run -e xteink_x4 -t upload`}</CodeBlock>

      <H2>Next steps</H2>
      <Ol>
        <Li>
          Understand the layering — read <A href="/docs/architecture">Architecture</A>.
        </Li>
        <Li>
          Tune which devices and capabilities your binary carries in{' '}
          <A href="/docs/build-composition">Build composition</A>.
        </Li>
        <Li>
          Bringing up a board that isn't in the matrix? Follow{' '}
          <A href="/docs/adding-a-device">Adding a device</A>.
        </Li>
      </Ol>
    </>
  )
}
