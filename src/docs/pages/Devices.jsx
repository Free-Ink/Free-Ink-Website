import { Lead, P, H2, A, Ul, Li, Code, Table, Callout } from '../prose.jsx'

function Status({ full, children }) {
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] whitespace-nowrap ${
        full
          ? 'bg-flame-500/10 text-flame-700 dark:text-flame-400'
          : 'bg-stone-500/10 text-stone-500 dark:text-stone-400'
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${full ? 'bg-flame-500' : 'bg-stone-400'}`} />
      {children}
    </span>
  )
}

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
        head={['Device', 'MCU', 'Controller', 'Panel', 'Status']}
        rows={[
          ['Xteink X4', 'ESP32-C3', 'SSD1677', '800×480 B/W + 4-level gray', <Status key="s" full>full</Status>],
          ['Xteink X3', 'ESP32-C3', 'UC8253', '792×528 B/W + 4-level gray, BQ27220 I²C gauge', <Status key="s" full>full · runtime-selected</Status>],
          ['de-link', 'ESP32-S3', 'SSD1677', '800×480 B/W + gray, frontlight, SDMMC SD', <Status key="s" full>full</Status>],
          ['M5Stack PaperColor', 'ESP32-S3', 'ED2208', '400×600 Spectra-6 color, built-in speaker (ES8311 + AW8737A amp), 2× RGB LEDs', <Status key="s" full>full · native + M5GFX backend</Status>],
          ['Murphy M3', 'ESP32-S3', 'UC8253', '240×416 B/W, CHSC6x touch, PWM frontlight', <Status key="s" full>full</Status>],
          ['LilyGo T5 S3', 'ESP32-S3', 'ED047TC1 (raw parallel)', '960×540 16-gray, GT911 touch, backlight, I²C gauge', <Status key="s" full>full · via LovyanGFX</Status>],
          ['M5Paper v1.1', 'ESP32 (classic)', 'IT8951E', '540×960 16-gray ED047TC1, GT911 touch, GPIO35 ADC battery', <Status key="s" full>full · hand-rolled IT8951</Status>],
        ]}
      />
      <P>
        X3 and X4 share the ESP32-C3 and a pinout, so a single firmware binary drives both — it carries
        both board profiles (<Code>XTEINK_X4</Code> and <Code>XTEINK_X3</Code>) and picks one at runtime
        via <Code>setDisplayX3()</Code>, which swaps the active profile and driver. Distinct-MCU boards
        build their own binary, selected with a board macro. A build targets exactly one of{' '}
        <strong>three MCU families</strong> — ESP32-C3 (X3/X4), ESP32-S3 (de-link, PaperColor, Murphy,
        LilyGo) or classic ESP32 (M5Paper v1.1) — and <Code>BoardConfig</Code> rejects mixing families
        at compile time.
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
        See <A href="/docs/adding-a-device">Adding a device</A> for the external-library driver pattern.
      </P>
      <P>
        The <strong>Murphy M3</strong> (CrowPanel 3.7″) pairs its UC8253 with a 90° hardware rotation:
        the controller is a 240×416 portrait panel held landscape, so the facade owns a 416×240
        framebuffer and the <Code>Uc8253MurphyDriver</Code> rotates each plane into controller RAM on
        write. It loads dual waveform banks — a full 3-phase (ghost-clearing) LUT and a
        destination-drive-only fast LUT — and promotes a fast refresh to a full one every few refreshes
        to keep ghosting in check. CHSC6x touch, a PWM frontlight and an ES8388-compatible I2S audio
        codec (driven by <A href="/docs/lib-audio">AudioManager</A>) round out the board.
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

      <H2>Capacitive touch</H2>
      <P>
        Touch is implemented for two controllers (gated by <Code>FREEINK_CAP_TOUCH</Code>):
      </P>
      <Ul>
        <Li>
          <strong>CHSC6x</strong> (Murphy M3) — IRQ-driven, ported from the upstream driver.
        </Li>
        <Li>
          <strong>GT911</strong> (LilyGo T5 S3 and M5Paper v1.1) — polled, raw register reads plus the
          reset/address dance. Its capacitive home key is surfaced via <Code>wasHomeKeyPressed()</Code>.
        </Li>
      </Ul>
      <P>
        The InputManager exposes <Code>hasTouch</Code> / <Code>isTouchPressed</Code> /{' '}
        <Code>wasTouchPressed</Code> / <Code>wasTouchReleased</Code> / <Code>getTouchPoint</Code>;
        coordinates are delivered raw-panel-oriented and the app owns rotation. The GT911 boards set
        their <Code>TouchConfig</Code> in the board profile (e.g.{' '}
        <Code>BoardConfig::LILYGO_T5_PRO_GT911</Code>). See the{' '}
        <A href="/docs/lib-input">InputManager reference</A>.
      </P>
    </>
  )
}
