import { Lead, P, H2, A, Code, CodeBlock } from '../prose.jsx'

export default function RepositoryLayout() {
  return (
    <>
      <Lead>
        Every library is a self-contained PlatformIO library under <Code>libs/</Code>, grouped by
        domain. You depend on each one by symlink in your <Code>platformio.ini</Code>.
      </Lead>

      <CodeBlock>{`libs/
  display/FreeInkDisplay/      facade + EInkDisplay shim + per-controller drivers + LUTs
  hardware/BoardConfig/        board profiles & capability descriptors
  hardware/InputManager/       buttons + capacitive touch (CHSC6x, GT911)
  hardware/BatteryMonitor/     ADC battery + optional charge-sense
  hardware/SDCardManager/      SD storage (SdFat-over-SPI or native SDMMC)
  hardware/PowerManager/       per-SoC deep-sleep wake-on-power-button
  hardware/FrontlightManager/  PWM frontlight (de-link)
  hardware/AudioManager/       WAV-over-I2S audio (Murphy M3 ES8388, M5 ES8311)
  hardware/LedManager/         addressable RGB LEDs (M5 PaperColor, WS2812-compatible)
  network/SecureNet/           wolfSSL TLS 1.3 client + HTTP shim (opt-in)
  ui/FreeInkUI/                immediate-mode UI framework (opt-in, host-tested)`}</CodeBlock>

      <P>
        The display package holds the facade (<Code>FreeInkDisplay</Code>), the <Code>EInkDisplay</Code>{' '}
        compatibility shim, each controller's <Code>PanelDriver</Code> in its own file under{' '}
        <Code>src/driver/</Code>, the shared <Code>EpdBus</Code>, and the waveform LUTs under{' '}
        <Code>src/lut/</Code>. For how these layers relate, see <A href="/docs/architecture">Architecture</A>;
        for the public surface of each library, see the <A href="/docs/api">Libraries</A> overview.
      </P>

      <H2>Repository &amp; contributing</H2>
      <P>
        The SDK lives at{' '}
        <A href="https://github.com/Free-Ink/freeink-sdk">github.com/Free-Ink/freeink-sdk</A>. If your
        work is part of the upstream lineage and you'd like your credit corrected or a link added, open
        an issue or email <Code>hello@freeink.org</Code>.
      </P>
    </>
  )
}
