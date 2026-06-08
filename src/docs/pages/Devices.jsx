import { Lead, P, H2, A, Ul, Li, Code, Table } from '../prose.jsx'

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
          ['M5Stack PaperColor', 'ESP32-S3', 'ED2208', '400×600 Spectra-6 color', <Status key="s" full>full · native + M5GFX backend</Status>],
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
        to keep ghosting in check. CHSC6x touch and a PWM frontlight round out the board.
      </P>
      <P>
        The <strong>M5Paper v1.1</strong> is FreeInk's first <strong>classic ESP32</strong> target — a
        third MCU family alongside the C3 and S3 boards. Its 540×960 16-gray ED047TC1 sits behind an
        on-glass <strong>IT8951E</strong> controller, so FreeInk drives it with a <strong>hand-rolled
        IT8951 driver</strong> (<Code>It8951Driver</Code>) that owns its own SPI bus
        (<Code>usesExternalBus()</Code>). It loads frames by packing the 1-bpp framebuffer into the
        IT8951's 4-bpp image buffer on the fly, refreshes with the controller's native{' '}
        <Code>GC16</Code> / <Code>DU</Code> / <Code>A2</Code> waveform modes, and auto-rotates the
        landscape framebuffer onto the portrait panel. GT911 touch and a GPIO35 ADC battery read
        complete the board.
      </P>

      <H2>M5Stack PaperColor refresh behavior</H2>
      <P>
        The PaperColor is natively a <strong>six-color (Spectra 6), full-refresh</strong> panel: a
        complete OTP waveform takes <strong>~15 s</strong> — unusable for reading. To get
        reading-compatible speeds, FreeInk's native driver <strong>interrupts the refresh at ~340 ms</strong>.
        The colors settle in order with white settling last, so cutting off early leaves the panel
        black or yellow (depending on the inversion/polarity selected) rather than white — and FreeInk
        exploits that to produce a fast, high-contrast monochrome image. A true white background / full
        color requires running the complete waveform (<Code>requestCompleteWaveformNextRefresh()</Code>).
      </P>
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
