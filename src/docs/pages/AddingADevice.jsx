import { Lead, P, H2, A, Ol, Li, Code, Callout } from '../prose.jsx'

export default function AddingADevice() {
  return (
    <>
      <Lead>
        Bringing up a new board is mostly data entry: add a profile, reuse or add a driver, and give it
        a build env. The generic code doesn't change.
      </Lead>

      <H2>The steps</H2>
      <Ol>
        <Li>
          Add a <Code>BoardProfile</Code> to <Code>BoardConfig.h</Code> (pins, geometry, controller,
          input style, optional touch/frontlight/audio, panel <Code>orientation</Code>, and SD
          transport) and a board macro for <Code>ACTIVE</Code>.
        </Li>
        <Li>
          <strong>If it uses an existing controller</strong>, reuse that driver — inject a tuned config
          struct (its own LUTs/waveforms) without editing the driver: define{' '}
          <Code>const Uc8253X3Config&amp; yourConfig();</Code> (or <Code>Ssd1677Config</Code>) in{' '}
          <Code>namespace freeink</Code> and build with{' '}
          <Code>-DFREEINK_UC8253_X3_CONFIG=yourConfig</Code> (or <Code>-DFREEINK_SSD1677_CONFIG=...</Code>
          ). <strong>If it's a new controller</strong>, add a <Code>PanelDriver</Code> in its own file
          plus a <Code>FREEINK_DRIVER_*</Code> flag.
        </Li>
        <Li>
          <strong>Each device gets its own profile, board macro, and build env.</strong>
        </Li>
      </Ol>

      <Callout title="Resolution is always a BoardProfile field">
        <p>
          <Code>displayWidth</Code> / <Code>displayHeight</Code> live in the profile. Every driver reads
          its geometry from the active profile (and <Code>getDisplayWidth()</Code> /{' '}
          <Code>getDisplayHeight()</Code> pass it to firmware); no driver special-cases its own size.
          The config struct is purely waveforms/LUTs. These are orthogonal: a different-size UC8253
          panel sets its size in its profile and its waveforms in a config.
        </p>
      </Callout>

      <P>
        Panel <strong>mount orientation</strong> is profile data too: set <Code>orientation</Code> to{' '}
        <Code>NO_FLIP</Code>, <Code>MIRROR_X</Code>, <Code>MIRROR_Y</Code> or <Code>ROTATE_180</Code> and
        the SSD1677 driver mirrors in hardware — no firmware-side rotate, no compile-time flag.
        Likewise, a board wired for 4-bit SDMMC sets <Code>sdmmc</Code> (busWidth 1 or 4) and gets the
        native SDMMC backend instead of SdFat-over-SPI; see{' '}
        <A href="/docs/build-composition">Build composition</A>.
      </P>

      <H2>When can two devices share a binary?</H2>
      <P>
        Two devices may share one binary only when they're distinguishable at runtime. That's how
        Xteink X3 and X4 ride one ESP32-C3 env: two full profiles (<Code>XTEINK_X4</Code>{' '}
        800×480/SSD1677 and <Code>XTEINK_X3</Code> 792×528/UC8253) compile into the same bin, and{' '}
        <Code>setDisplayX3()</Code> swaps the active profile + driver after I2C fingerprinting. They
        happen to share a pinout, but each is a real profile — not one profile doing double duty.
      </P>
      <P>
        Same MCU but different GPIOs, screen, or controller ⇒ a separate profile and a separate env,
        never an auto-shared bin.
      </P>

      <H2>Devices backed by external libraries</H2>
      <P>
        A <Code>PanelDriver</Code> doesn't have to emit raw SPI — it can wrap a third-party display
        library. Some panels need this: a raw-parallel EPD with no on-glass controller (e.g. the LilyGo
        T5 S3's ED047TC1) is driven by <strong>LovyanGFX's <Code>Panel_EPD</Code></strong> (bundled in{' '}
        <Code>m5stack/M5GFX</Code>). FreeInk ships exactly that as <Code>LgfxEpdDriver</Code>{' '}
        (<Code>usesExternalBus()</Code>), and the M5 PaperColor's optional <Code>M5OfficialDriver</Code>{' '}
        wraps M5GFX the same way. FreeInk pulls these libraries in <strong>per device</strong>, so builds
        that don't use them stay lean:
      </P>
      <Ol>
        <Li>
          Put the external <Code>#include</Code> and driver code inside the driver's{' '}
          <Code>#if FREEINK_DRIVER_&lt;NAME&gt;</Code> guard (the flag the registry derives from the
          device — e.g. <Code>FREEINK_DRIVER_LGFX_EPD</Code>). PlatformIO's LDF (chain mode) only links
          the external library when that driver actually compiles — other devices are unaffected.
        </Li>
        <Li>
          Add the external library to that device's env <Code>lib_deps</Code> in your{' '}
          <Code>platformio.ini</Code> (see <A href="/docs/installation">PlatformIO setup</A>). It's
          installed for that env only.
        </Li>
        <Li>
          Implement the device's <Code>PanelDriver</Code> as a thin wrapper over the library's API
          (init / draw / refresh / sleep), exactly like the native drivers — the facade can't tell the
          difference.
        </Li>
      </Ol>
      <P>
        This keeps the SDK's display surface uniform (<Code>EInkDisplay</Code> everywhere) while letting
        each device bring whatever rendering stack it needs. The LilyGo T5 S3 is the worked example — its{' '}
        <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/docs/lilygo-t5s3-support.md">
          support doc
        </A>{' '}
        covers the board-injected <Code>LgfxEpdConfig</Code> + power hooks and the remaining
        board-support gaps.
      </P>
    </>
  )
}
