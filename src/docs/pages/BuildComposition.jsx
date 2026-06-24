import { Lead, P, H2, A, Code, Table, Callout } from '../prose.jsx'

export default function BuildComposition() {
  return (
    <>
      <Lead>
        A FreeInk build is composed along two axes: the <strong>devices</strong> a binary supports and
        the <strong>capabilities</strong> compiled into it. Capabilities default on when an included
        device needs them, so each binary stays as tight as the hardware allows.
      </Lead>

      <H2>Devices</H2>
      <P>
        <Code>-DFREEINK_DEVICE_&lt;NAME&gt;</Code> declares which hardware the binary supports. Each
        device pulls in its panel driver, adds its board profile to the runtime registry, and turns on
        its default capabilities. You can compose any set that shares an MCU family — a build targets
        exactly one of ESP32-C3, ESP32-S3 or classic ESP32, and mixing families is a compile error.
      </P>
      <Table
        head={['Pass', 'Result']}
        rows={[
          [<Code key="a">-DFREEINK_DEVICE_X4</Code>, 'X4 only — links just SSD1677 (tightest)'],
          [
            <Code key="b">-DFREEINK_DEVICE_X3 -DFREEINK_DEVICE_X4</Code>,
            <>X3 and X4 in one C3 binary, runtime-selected via <Code>setDisplayX3()</Code></>,
          ],
          [<Code key="c">-DFREEINK_DEVICE_DELINK</Code>, 'de-link (S3, SSD1677 + frontlight)'],
          [<Code key="d">-DFREEINK_DEVICE_M5</Code>, 'M5 PaperColor (S3, ED2208 + color)'],
          [<Code key="e">-DFREEINK_DEVICE_MURPHY</Code>, 'Murphy M3 (S3, UC8253 + touch + frontlight)'],
          [<Code key="g">-DFREEINK_DEVICE_LILYGO</Code>, 'LilyGo T5 S3 (S3, ED047TC1 raw-parallel EPD via LovyanGFX)'],
          [<Code key="h">-DFREEINK_DEVICE_M5PAPER</Code>, 'M5Paper v1.1 (classic ESP32, IT8951E + GT911 touch)'],
          [<Code key="s">-DFREEINK_DEVICE_STICKY</Code>, 'Sticky (S3, SSD1677 800×480 + GT911 touch + PDM mic + sensor suite)'],
          [<em key="f">(none)</em>, <><strong>compile error</strong> — a build must select at least one device</>],
        ]}
      />
      <P>
        Multiple different-pinout devices on one MCU are runtime-selected: <Code>ACTIVE</Code> defaults
        to a compile-time default and the consumer calls <Code>BoardConfig::selectDevice(...)</Code>{' '}
        after its own detection. For X3/X4, the SDK now ships the canonical detector —{' '}
        <A href="/docs/lib-detect">XteinkDetect</A>'s <Code>selectXteinkDevice()</Code> I²C-fingerprints
        the X3-only peripherals and selects the profile for you.
      </P>
      <P>
        Every SDK library compiles cleanly on <strong>all three</strong> MCU families — ESP32-C3,
        ESP32-S3 and the classic ESP32 — so only a consumer's own layer can block a multi-MCU build by
        hardcoding chip-specific code. See{' '}
        <A href="/docs/mcu-portability">MCU portability</A>.
      </P>

      <H2>Capabilities</H2>
      <P>
        <Code>-DFREEINK_CAP_&lt;NAME&gt;</Code> gates feature <em>code</em> to keep binaries tight. Each
        defaults on when an included device needs it; force with <Code>=0</Code> / <Code>=1</Code>.
      </P>
      <Table
        head={['Flag', 'Gates', 'Default']}
        rows={[
          [<Code key="a">FREEINK_CAP_TOUCH</Code>, 'capacitive touch decoder (InputManager)', 'on if a device has touch'],
          [<Code key="b">FREEINK_CAP_FRONTLIGHT</Code>, 'PWM frontlight (FrontlightManager)', 'on if a device has a frontlight'],
          [<Code key="c">FREEINK_CAP_COLOR</Code>, 'color panel code', 'on for M5'],
          [<Code key="d">FREEINK_CAP_AUDIO</Code>, 'WAV-over-I2S audio (AudioManager: ES8388 / ES8311 codec)', 'on for Murphy M3 and M5 PaperColor'],
          [<Code key="led">FREEINK_CAP_LED</Code>, 'addressable RGB LEDs (LedManager)', 'on for M5 PaperColor'],
          [<Code key="buz">FREEINK_CAP_BUZZER</Code>, 'LEDC PWM tone buzzer (Buzzer)', 'on for Sticky and Murphy M3'],
          [<Code key="mic">FREEINK_CAP_MIC</Code>, 'PDM microphone capture (Microphone)', 'on for Sticky'],
          [<Code key="rtc">FREEINK_CAP_RTC</Code>, 'PCF8563 real-time clock (Rtc)', 'on for Sticky'],
          [<Code key="th">FREEINK_CAP_TEMP_HUMIDITY</Code>, 'SHT40 temperature + humidity (EnvironmentSensor)', 'on for Sticky'],
          [<Code key="imu">FREEINK_CAP_IMU</Code>, 'LSM6DS3TR-C 6-axis IMU (Imu)', 'on for Sticky'],
          [<Code key="e">FREEINK_CAP_NET_TLS13</Code>, <>wolfSSL TLS 1.3 (≡ <Code>FREEINK_NET_WOLFSSL</Code>)</>, 'off'],
          [<Code key="ble">FREEINK_CAP_BLE_HID_HOST</Code>, <>BLE HID host (<A href="/docs/lib-ble">BleKeyboardHost</A>; add a NimBLE <Code>lib_dep</Code>, ESP32-C3/S3 only)</>, 'off'],
        ]}
      />

      <H2>Other flags</H2>
      <Table
        head={['Flag', 'Effect']}
        rows={[
          [
            <Code key="b">-DFREEINK_DISPLAY_FLIPPED</Code>,
            <>(or <Code>-DFLIPPED</Code>) back-compat alias for <Code>BoardProfile.orientation = MIRROR_Y</Code> on SSD1677</>,
          ],
          [
            <Code key="sd">-DFREEINK_SD_SDMMC=1</Code>,
            <>use the native 4-bit SDMMC backend (needs <Code>-DUSE_BLOCK_DEVICE_INTERFACE=1</Code>); auto-on for de-link</>,
          ],
          [
            <Code key="bg">-DFREEINK_BATTERY_I2C_GAUGE=1</Code>,
            <>compile the I²C fuel-gauge backend (BQ27220/BQ25896); auto-on for X3, LilyGo and Sticky. Gauge-vs-ADC is then runtime per profile, so X3 (gauge) + X4 (ADC) coexist in one binary</>,
          ],
          [
            <Code key="m5">-DFREEINK_M5_OFFICIAL=1</Code>,
            <>M5 PaperColor only: use the M5Unified + M5GFX vendor backend instead of the native ED2208 driver (M5GFX owns the bus)</>,
          ],
          [
            <Code key="m5dark">-DFREEINK_M5_DARK_FAST_REFRESH=1</Code>,
            <>M5 PaperColor only: render a dark, inverted UI on fast (interrupted) refreshes — the upstream community-SDK "dark hack" (logical white written as controller black). Default <Code>0</Code> keeps the native light "paper" UI, where the cut-off waveform leaves logical-white pixels yellow. Complete waveforms stay truthful either way</>,
          ],
          [
            <Code key="c">-DEINK_DISPLAY_SINGLE_BUFFER_MODE=1</Code>,
            'single framebuffer (uses controller RAM as the previous frame)',
          ],
          [
            <Code key="fb">-DFREEINK_FB_PSRAM=1</Code>,
            <>place the facade framebuffer(s) in PSRAM heap (<Code>MALLOC_CAP_SPIRAM</Code>, allocated in <Code>begin()</Code>) instead of static DRAM <Code>.bss</Code>; auto-on for M5Paper, off everywhere else. Needs <Code>-DBOARD_HAS_PSRAM</Code></>,
          ],
          [
            <Code key="d">-DFREEINK_NET_WOLFSSL=1</Code>,
            <>enable the wolfSSL TLS 1.3 transport in <Code>SecureNet</Code></>,
          ],
        ]}
      />

      <P>
        Panel <strong>orientation / mirroring is per-board data, not a flag</strong>: set{' '}
        <Code>BoardProfile.orientation</Code> to <Code>NO_FLIP</Code>, <Code>MIRROR_X</Code>,{' '}
        <Code>MIRROR_Y</Code> or <Code>ROTATE_180</Code>. The SSD1677 driver applies it in hardware
        (mirrorX via RAM column addressing, mirrorY via gate scan). 90° / 270° need a software
        transpose and are a follow-up. See <A href="/docs/adding-a-device">Adding a device</A>.
      </P>

      <P>
        <strong>Power-enable rails and the I²C bus are board data too.</strong> A profile can name an
        active-high <Code>powerEnable</Code> GPIO for the panel (<Code>DisplayPins</Code>), the SD card
        rail (<Code>SdPins</Code>), the touch controller (<Code>TouchConfig</Code>) or the mic
        (<Code>MicConfig</Code>); the SDK raises each at <Code>begin()</Code> with a settle delay, and a
        profile that leaves it unassigned just skips it. On multi-bus SoCs (ESP32-S3), a profile picks{' '}
        <Code>Wire</Code> vs <Code>Wire1</Code> per peripheral via an <Code>i2cBus</Code> field, so the
        Sticky keeps its touch controller and its sensor cluster on separate physical buses. None of
        this is a build flag — it's data in <A href="/docs/lib-board">BoardConfig</A>.
      </P>

      <P>
        <strong>Framebuffer placement.</strong> The facade's framebuffer(s) sit in static DRAM{' '}
        <Code>.bss</Code> by default — fastest, and the panel sizes fit comfortably on the C3/S3 parts
        (the largest, 960×540, is ~63 KB). M5Paper v1.1 is the exception: the classic ESP32 shares its
        ~300 KB of DRAM with the IDF/WiFi stacks, so that 63 KB framebuffer overflows internal RAM.{' '}
        <Code>FREEINK_FB_PSRAM</Code> defaults on there and heap-allocates the framebuffer in PSRAM
        once, in <Code>begin()</Code>, with a DRAM fallback. DRAM is faster than cache-backed PSRAM and
        the buffer is touched heavily during composition, so it stays off elsewhere — but any DRAM-tight
        build (e.g. a feature-heavy LilyGo T5 S3) can opt in with <Code>-DFREEINK_FB_PSRAM=1</Code>.
      </P>

      <Callout title="One binary, two devices">
        <p>
          X3 and X4 share the ESP32-C3 and a pinout, so a single firmware binary drives both: it
          carries both board profiles and picks one at runtime via <Code>setDisplayX3()</Code>. The
          rules for when devices can share a binary are covered in{' '}
          <A href="/docs/adding-a-device">Adding a device</A>.
        </p>
      </Callout>
    </>
  )
}
