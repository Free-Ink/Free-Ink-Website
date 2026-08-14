import { Lead, P, H2, A, Ul, Li, Code, Table, Callout } from '../prose.jsx'

export default function Devices() {
  return (
    <>
      <Lead>
        FreeInk ships drivers and board profiles for the following devices. Related boards can share a
        single firmware build, detected and configured at runtime; new controllers slot in as a
        standalone driver behind the facade.
      </Lead>

      <H2>Device matrix</H2>
      <Table
        head={['Device', 'MCU', 'Controller', 'Panel']}
        rows={[
          ['Xteink X4', 'ESP32-C3', 'SSD1677', '800×480 B/W + 4-level gray'],
          ['Xteink X4 Pro', 'ESP32-S3', 'SSD1677 / UC8179', '800×480 B/W, GT911 touch, warm/cool frontlight, PCF8563 RTC, CW2017 gauge, SDMMC SD, USB MSC'],
          ['Xteink X3', 'ESP32-C3', 'UC8253 / UC8279', '792×528 B/W + 4-level gray, BQ27220 I²C gauge, DS3231 RTC, QMI8658 IMU'],
          ['de-link', 'ESP32-S3', 'SSD1677', '800×480 B/W + gray, frontlight, SDMMC SD'],
          ['M5Stack PaperColor', 'ESP32-S3', 'ED2208', '400×600 Spectra-6 color, built-in speaker (ES8311 + AW8737A amp), 2× RGB LEDs'],
          ['Murphy M3', 'ESP32-S3', 'UC8253', '240×416 B/W, CHSC6x touch, PWM frontlight'],
          ['Murphy M4', 'ESP32-S3', 'SSD1677', '800×480 B/W, FT6336U touch, 5-key nav, warm/cool frontlight, SDMMC SD, ADC battery'],
          ['LilyGo T5 S3', 'ESP32-S3', 'ED047TC1 (raw parallel)', '960×540 16-gray, GT911 touch, backlight, I²C gauge'],
          ['M5Paper v1.1', 'ESP32 (classic)', 'IT8951E', '540×960 16-gray ED047TC1, GT911 touch, GPIO35 ADC battery'],
          ['Sticky', 'ESP32-S3', 'SSD1677', '3.97" 800×480 B/W, GT911 touch, PDM mic, RTC + temp/humidity + IMU, BQ27220 gauge, buzzer'],
          ['M5 Paper Mono', 'ESP32-S3', 'SSD1677', '800×480 B/W + 3-gray, FT6336 touch, frontlight, PDM mic, buzzer, RGB LED, RX8130 RTC, SDMMC SD'],
          ['M5 PaperS3', 'ESP32-S3', 'ED047TC1 (raw parallel)', '4.7" 960×540 16-gray, GT911 touch-only, buzzer, BM8563 RTC, SPI SD'],
        ]}
      />
      <P>
        X3 and X4 share the ESP32-C3 and a pinout, so a single firmware binary drives both — it carries
        both board profiles (<Code>XTEINK_X4</Code> and <Code>XTEINK_X3</Code>) and picks one at runtime
        via <Code>setDisplayX3()</Code>, which swaps the active profile and driver. Distinct-MCU boards
        build their own binary, selected with a board macro. A build targets exactly one of{' '}
        <strong>three MCU families</strong> — ESP32-C3 (X3/X4), ESP32-S3 (X4 Pro, de-link, PaperColor,
        Murphy M3/M4, LilyGo, Sticky, Paper Mono, PaperS3) or classic ESP32 (M5Paper v1.1) — and{' '}
        <Code>BoardConfig</Code> rejects mixing families at compile time.
      </P>
      <P>
        The <strong>Xteink X4 Pro</strong> is a distinct ESP32-S3 device, not the C3 X4 — its own{' '}
        <Code>XTEINK_X4_PRO</Code> profile (16&nbsp;MB flash, 8&nbsp;MB PSRAM), built with{' '}
        <Code>-DFREEINK_DEVICE_X4PRO=1</Code>. It reuses the X4's 800×480 SSD1677 panel and OTP waveform,
        and adds GT911 touch, a dual warm/cool frontlight, a PCF8563-compatible RTC, a CW2017 fuel gauge,
        native 1-bit SDMMC storage, and host transfer over USB — as mass storage or a serial transport. The panel controller <strong>varies by production
        batch</strong> — original units carry the SSD1677, newer ones a UC8179 (an UltraChip part on the
        same glass and pinout) — so the firmware fingerprints the live display bus at boot and promotes
        to the matching driver via <A href="/docs/lib-detect">XteinkDetect</A>'s{' '}
        <Code>applyXteinkDisplayController()</Code> before <Code>begin()</Code>.
      </P>
      <P>
        The <strong>M5Stack Paper Mono</strong> (PaperS3) is an ESP32-S3 board on the same 800×480
        SSD1677 glass, built with <Code>-DFREEINK_DEVICE_PAPERMONO=1</Code>. Its own{' '}
        <Code>PaperMonoDriver</Code> runs <strong>host-authored 111-byte LUTs</strong> instead of the
        stock OTP set: binary UI and Fast reader paints use the panel's non-flashing internal waveform,
        while balanced book pages get a single target-coded W/G/B <strong>3-gray</strong> activation with
        a white-biased per-page top-up that erases a little residue on every turn rather than letting
        ghosts accumulate. On-board an <Code>M5IOE1</Code> I²C IO expander and an <Code>M5PM1</Code> PMIC
        switch the EPD, frontlight (AW9967 boost driver) and microSD rails, so those GPIO fields stay
        unassigned and a consumer board-support library (<Code>PaperMonoBoard.h</Code> /{' '}
        <Code>M5Ioe1.h</Code>) supplies the power hooks. FT6336 capacitive touch, a PDM mic, a passive
        buzzer, a discrete RGB LED, an RX8130 RTC and native SDMMC storage round out the profile.
      </P>
      <P>
        de-link reuses the X4's SSD1677 panel on an ESP32-S3, adding a warm/cool frontlight and{' '}
        <strong>native 4-bit SDMMC storage</strong>. SdFat can't drive SDIO, so FreeInk mounts a
        volume on an esp-idf SDMMC block device (auto-enabled via <Code>FREEINK_SD_SDMMC</Code>) — see{' '}
        <A href="/docs/build-composition">Build composition</A>. Its panel orientation is set in the
        board profile rather than at compile time, so an upside-down PCB just sets{' '}
        <Code>ROTATE_180</Code> and the driver mirrors in hardware.
      </P>
      <P>
        The <strong>LilyGo T5 S3</strong> is a different display class: its ED047TC1 is a raw 960×540
        16-gray parallel EPD with no on-glass controller, so FreeInk drives it through{' '}
        <strong>LovyanGFX's <Code>Panel_EPD</Code></strong> (bundled in <Code>m5stack/M5GFX</Code>)
        rather than emitting raw SPI. The <Code>LgfxEpdDriver</Code> reports{' '}
        <Code>usesExternalBus()</Code> and holds an 8-bit grayscale canvas in PSRAM; the B/W and 16-gray
        paths both push that sprite at the requested waveform. The <Code>BoardConfig::LILYGO_T5S3</Code>{' '}
        profile carries its geometry, GT911 touch, PWM backlight and BQ27220/BQ25896 I²C battery gauge.
        A dedicated <Code>BoardT5S3</Code> support library now fills the board-level gaps — it drives the
        PCA9535 I²C IO expander (the user button) and the TPS65185 EPD PMIC, exposes mutex-guarded I²C
        access, and supplies the board-injected <Code>LgfxEpdConfig</Code> + power hooks. See{' '}
        <A href="/docs/adding-a-device">Adding a device</A> for the external-library driver pattern.
      </P>
      <P>
        The <strong>Murphy M3</strong> (CrowPanel 3.7″) pairs its UC8253 with a 90° hardware rotation:
        the controller is a 240×416 portrait panel held landscape, so the facade owns a 416×240
        framebuffer and the <Code>Uc8253MurphyDriver</Code> rotates each plane into controller RAM on
        write. It loads dual waveform banks — a full 3-phase (ghost-clearing) LUT and a
        destination-drive-only fast LUT — and promotes a fast refresh to a full one every few refreshes
        to keep ghosting in check. CHSC6x touch, a PWM frontlight, an ES8388-compatible I2S audio
        codec (driven by <A href="/docs/lib-audio">AudioManager</A>) and a battery ADC on GPIO9 (read
        through <A href="/docs/lib-battery">BatteryMonitor</A>) round out the board.
      </P>
      <P>
        The <strong>Murphy M4</strong> is a larger ESP32-S3 sibling of the M3: it drops the small UC8253
        for the X4-class <strong>SSD1677</strong> on a 800×480 GDEQ0426T82 panel (landscape glass mounted
        in a portrait housing; a software rotation is pending). It swaps the M3's CHSC6x for{' '}
        <strong>FT6336U</strong> capacitive touch, keeps a five-key nav cluster, and adds a{' '}
        <strong>dual warm/cool frontlight</strong> plus native 4-bit SDMMC storage, with battery read off
        an ADC divider. There's no audio codec on this one — the buzzer/codec fields stay unassigned.
      </P>
      <P>
        The <strong>M5Paper v1.1</strong> is FreeInk's first <strong>classic ESP32</strong> target — a
        third MCU family alongside the C3 and S3 boards. Its 540×960 16-gray ED047TC1 sits behind an
        on-glass <strong>IT8951E</strong> controller, so FreeInk drives it with a <strong>hand-rolled
        IT8951 driver</strong> (<Code>It8951Driver</Code>) that owns its own SPI bus
        (<Code>usesExternalBus()</Code>). It loads frames by packing the 1-bpp framebuffer into the
        IT8951's 4-bpp image buffer on the fly and auto-rotates the landscape framebuffer onto the
        portrait panel. It drives the controller's native waveform modes — <Code>GC16</Code> for a full
        clearing refresh, <Code>DU</Code> for fast B/W page turns, and <Code>DU4</Code> for 4-level
        grayscale updates without a full-area flash — and the full anti-aliased grayscale path runs here
        too, reconstructing the base plus LSB/MSB planes into the IT8951's native 16-level format. A
        configurable <Code>ghostClearInterval</Code> periodically promotes a differential (DU/DU4)
        refresh to a GC16 clear, so residue doesn't accumulate during navigation without any firmware
        intervention. GT911 touch and a GPIO35 ADC battery read complete the board. Its only physical buttons are a 3-position rotary wheel: the two sides map
        to <Code>BTN_UP</Code> / <Code>BTN_DOWN</Code> for page navigation and the push is{' '}
        <Code>BTN_CONFIRM</Code>, which doubles as the power/wake button (it sits on an RTC GPIO, so it
        drives the <Code>ext1</Code> deep-sleep wakeup). Back/Left/Right come from the touch panel.
      </P>
      <P>
        The <strong>M5Stack PaperS3</strong> is the S3 successor to the M5Paper v1.1: the same 960×540
        16-gray ED047TC1 glass but with <strong>no IT8951</strong> — the S3 drives the panel directly
        over the 8-bit parallel bus, the same display class as the LilyGo T5 S3, so it shares the{' '}
        <Code>LgfxEpd</Code> driver (<A href="/docs/adding-a-device">LovyanGFX</A>{' '}
        <Code>Panel_EPD</Code> via <Code>m5stack/M5GFX</Code>). Unlike the LilyGo there's no PMIC or IO
        expander — the EPD rails are plain GPIOs that <Code>Bus_EPD</Code>'s stock power sequence drives
        itself, so the <Code>BoardPaperS3</Code> support library carries real pins and no power hooks.
        There are <strong>no firmware-readable buttons</strong>: the single side button feeds a PMS150G
        power-latch chip, so all navigation is <strong>GT911 touch</strong> (tap zones and gestures are
        firmware policy), and power-off pulses a GPIO rather than releasing a latch. A BM8563 RTC (whose
        alarm line wakes the latch), an ADC battery read and a LEDC buzzer round it out; the on-board
        BMI270 IMU isn't a supported <Code>ImuType</Code> yet, so it's left out of the profile.
      </P>
      <P>
        The <strong>Sticky</strong> (Seeed) reuses the X4-class <strong>SSD1677</strong> driver for
        its 3.97″ 800×480 B/W panel (its 24-pin FPC needs vendor full/fast update sequences and border
        tracking, supplied as driver config), with GT911 touch. Beyond the display it carries a whole
        peripheral suite, each behind its own opt-in library: a <strong>PDM microphone</strong>{' '}
        (<A href="/docs/lib-mic">Microphone</A>), a <strong>PCF8563 RTC</strong>{' '}
        (<A href="/docs/lib-rtc">Rtc</A>), an <strong>SHT40</strong> temperature/humidity sensor{' '}
        (<A href="/docs/lib-env">EnvironmentSensor</A>), an <strong>LSM6DS3TR-C</strong> 6-axis IMU{' '}
        (<A href="/docs/lib-imu">Imu</A>), a <strong>BQ27220</strong> I²C fuel gauge{' '}
        (<A href="/docs/lib-battery">BatteryMonitor</A>), a LEDC <strong>buzzer</strong>{' '}
        (<A href="/docs/lib-buzzer">Buzzer</A>), and an SPI MicroSD that shares the display bus. It is
        the SDK's first <strong>multi-bus I²C</strong> board: the GT911 touch controller sits on{' '}
        <Code>Wire</Code>, while the gauge and the whole sensor cluster share <Code>Wire1</Code>, kept
        apart so neither stalls the other. Power-enable GPIOs gate the panel, touch controller, SD rail
        and mic rail independently (the board profile names each pin; the SDK raises them at{' '}
        <Code>begin()</Code>). Its GT911 is mounted rotated, corrected SDK-side by the touch profile's{' '}
        <Code>swapXY</Code> / <Code>flipX</Code> / <Code>flipY</Code> flags.
      </P>

      <H2>M5Stack PaperColor refresh behavior</H2>
      <P>
        The PaperColor is natively a <strong>six-color (Spectra 6), full-refresh</strong> panel: a
        complete OTP waveform takes <strong>~15 s</strong> — unusable for reading. To get
        reading-compatible speeds, FreeInk's native driver <strong>interrupts the refresh at ~340 ms</strong>.
        The colors settle in order with white settling last, so cutting off early leaves logical-white
        pixels <strong>yellow</strong> rather than settled white — and FreeInk's default light "paper" UI
        embraces that, drawing dark text on the warm yellow ground for a fast, high-contrast monochrome
        image. Passing <Code>-DFREEINK_M5_DARK_FAST_REFRESH=1</Code> instead selects the upstream
        community-SDK "dark hack" (logical white written as the controller's black), giving an inverted
        black-background UI on fast refreshes. Either way, a true white background / full color requires
        running the complete waveform (<Code>requestCompleteWaveformNextRefresh()</Code>), which settles
        truthfully. The board also carries a <strong>built-in speaker</strong> — an ES8311 codec into an
        AW8737A amp, driven by <A href="/docs/lib-audio">AudioManager</A> — and{' '}
        <strong>two RGB LEDs</strong> via <A href="/docs/lib-led">LedManager</A>. Its rails, battery
        charging and LEDs all hang off one PMIC (see below).
      </P>
      <Callout title="DC balance — schedule periodic complete waveforms" tone="warn">
        <p>
          E-paper waveforms are DC-balanced only when they run to completion; the interrupted path
          leaves a small net charge on every pixel each refresh. That charge <strong>accumulates</strong>{' '}
          — over hours of interrupted-only operation the panel visibly darkens and color intensity fades
          (the driver's every-6th-refresh full-panel pass is itself interrupted, so it clears geometric
          ghosting, not charge). Consumers must periodically promote a refresh to the complete waveform
          via <Code>requestCompleteWaveformNextRefresh()</Code> — roughly hourly works well — timed
          around their own UX, since the complete waveform blocks for ~15 s.
        </p>
      </Callout>
      <P>Two backends are selectable for this device:</P>
      <Ul>
        <Li>
          <strong>Native ED2208 (default)</strong> — the fast interrupted-refresh path above.
        </Li>
        <Li>
          <strong>M5 official</strong> (<Code>-DFREEINK_M5_OFFICIAL=1</Code>) — wraps M5's own
          M5Unified + M5GFX stack for users who prefer the vendor path (slower, but standard). This
          pulls the M5 libraries only on that env; M5GFX owns the bus (<Code>usesExternalBus()</Code>).
        </Li>
      </Ul>

      <H2>Power management (M5PM1)</H2>
      <P>
        The PaperColor's rails, battery charging and RGB LEDs all hang off one PMIC — the{' '}
        <strong>M5PM1</strong> (a PY32L020) on the board's internal I²C bus. Two FreeInk modules drive it
        (the ED2208 display driver and <A href="/docs/lib-led">LedManager</A>), and they share one
        physical config register, so the register map, bus init and boot power policy live in a single{' '}
        <strong>header-only driver</strong> (<Code>M5Pm1.h</Code>) rather than private copies that drift
        apart. Both libraries pick it up through their existing <Code>BoardConfig</Code> dependency.
      </P>
      <P>
        The PMIC's <Code>PWR_CFG</Code> register <strong>auto-clears on every reset</strong>, so the
        display driver re-establishes the board's standing power state at each boot:
      </P>
      <Ul>
        <Li>
          <strong>Battery charging on</strong> (<Code>CHG_EN</Code>) — the PM1 only charges the 1250 mAh
          cell when this bit is set, and regulates the curve itself (charges only while USB is present,
          stops at full), so asserting it unconditionally is safe. Without it the battery never tops up
          over USB.
        </Li>
        <Li>
          <strong>5 V boost off</strong> (<Code>BOOST_EN</Code>) — the Grove/5VINOUT boost is unused on
          this board.
        </Li>
        <Li>
          <strong>RGB rail off + PM1 NeoPixel engine disabled</strong> — the 3.3 V LDO that feeds the
          WS2812 chain (<Code>LDO_EN</Code>) is owned by LedManager and raised lazily only while an LED
          is lit; the PM1's own built-in NeoPixel engine is switched off so the ESP owns the chain.
          Left on, that engine renders its own status pixel — the <strong>stuck green LED</strong> seen
          at boot — even while the ESP sleeps, and the state survives a USB reflash.
        </Li>
      </Ul>
      <P>
        The same PMIC also reports power telemetry, which{' '}
        <A href="/docs/lib-battery">BatteryMonitor</A> surfaces (auto-detected, no flag): battery voltage
        and percentage from <Code>VBAT</Code>, plus external-power presence on the DC input and the
        bidirectional USB-C rail. It has no charge-phase bit, so charging state stays unknown on this
        board.
      </P>

      <H2>Capacitive touch</H2>
      <P>
        Touch is implemented for three controllers (gated by <Code>FREEINK_CAP_TOUCH</Code>):
      </P>
      <Ul>
        <Li>
          <strong>CHSC6x</strong> (Murphy M3) — IRQ-driven, ported from the upstream driver.
        </Li>
        <Li>
          <strong>GT911</strong> (X4 Pro, LilyGo T5 S3, M5Paper v1.1, PaperS3 and Sticky) — raw register
          reads plus the reset/address dance; LilyGo runs it in IRQ mode, the others poll. Its capacitive
          home key is surfaced via <Code>wasHomeKeyPressed()</Code>. On the button-less PaperS3 it's the{' '}
          <em>only</em> input, so paging and navigation come entirely from tap zones and gestures.
        </Li>
        <Li>
          <strong>FT6336 / FT6336U</strong> (M5 Paper Mono, Murphy M4) — register-compatible with the
          FT5x06 family, with init retry for a slow power-up. It reports a portrait frame, so the profile
          swaps it into the panel-native landscape frame and flips to follow the mounted display.
        </Li>
      </Ul>
      <P>
        The InputManager exposes <Code>hasTouch</Code> / <Code>isTouchPressed</Code> /{' '}
        <Code>wasTouchPressed</Code> / <Code>wasTouchReleased</Code> / <Code>getTouchPoint</Code>, plus
        tap, swipe and activity edges (see the <A href="/docs/lib-input">InputManager reference</A>).
        GT911 boards set their <Code>TouchConfig</Code> in the board profile (e.g.{' '}
        <Code>BoardConfig::LILYGO_T5_PRO_GT911</Code>).
      </P>
      <P>
        <strong>Digitizer mounting is corrected SDK-side.</strong> A panel whose touch sensor is rotated
        or mirrored relative to the glass sets <Code>swapXY</Code>, <Code>flipX</Code> and{' '}
        <Code>flipY</Code> in its <Code>TouchConfig</Code> (the Sticky's portrait sensor on a landscape
        panel sets all three), and the raw range fields describe the <em>post-swap</em> axes — so the
        InputManager hands back panel-native coordinates and the app's orientation mapping follows
        rotation automatically. A <Code>TouchConfig.powerEnable</Code> pin lets a board gate the touch
        controller's power rail, raised before reset/probe.
      </P>
    </>
  )
}
