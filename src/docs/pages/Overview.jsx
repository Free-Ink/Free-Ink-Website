import { Lead, P, H2, A, Ul, Li, Code, Callout } from '../prose.jsx'

export default function Overview() {
  return (
    <>
      <Lead>
        FreeInk is a hardware-independent SDK for building e-paper reader firmware. It abstracts every
        device-specific detail — display controller, waveforms and LUTs, GPIOs, bus speeds, input
        style, touch, frontlight and audio — behind small, injectable interfaces, so the firmware
        calls one generic API and gets device-specific behavior.
      </Lead>

      <P>
        Adding a new device means adding <em>data</em> — a board profile plus a driver config — not
        editing the generic code. One codebase drives many panels, and a new board is a profile and a
        config, not a rewrite.
      </P>

      <H2>Drop-in compatible</H2>
      <P>
        FreeInk is drop-in compatible with firmware written against the original <Code>EInkDisplay</Code>{' '}
        / <Code>InputManager</Code> / <Code>BatteryMonitor</Code> / <Code>SDCardManager</Code> /{' '}
        <Code>BoardConfig</Code> API. Switching to FreeInk is a matter of repointing the library path —{' '}
        <Code>#include &lt;EInkDisplay.h&gt;</Code> and the <Code>EInkDisplay</Code> type keep working
        through a compatibility shim.
      </P>
      <P>
        Already running CrossPoint? It builds the X3 + X4 ESP32-C3 binary against this SDK with{' '}
        <strong>no source changes</strong>. See <A href="/docs/installation">PlatformIO setup</A>.
      </P>

      <H2>Why it's built this way</H2>
      <Ul>
        <Li>
          <strong>Nothing device-specific is hardcoded in generic code.</strong> GPIOs come from the{' '}
          <Code>EInkDisplay</Code> constructor and <Code>BoardConfig</Code>; SPI clocks have a
          controller default and a board override; waveforms, booster values, scan direction and
          refresh temperatures are injected through a driver config struct.
        </Li>
        <Li>
          <strong>New devices are data, not code.</strong> A new board fills in values; the generic
          driver consumes them. See <A href="/docs/adding-a-device">Adding a device</A>.
        </Li>
        <Li>
          <strong>Composable builds.</strong> A binary is composed along two axes — devices and
          capabilities — so each build stays as tight as the hardware allows. See{' '}
          <A href="/docs/build-composition">Build composition</A>.
        </Li>
      </Ul>

      <H2>Credit &amp; lineage</H2>
      <P>
        FreeInk is an independent, clean-room reorganization <strong>based on</strong> the work of the
        OpenX4 E-Paper Community SDK (<Code>open-x4-epaper/community-sdk</Code>, MIT) and its
        contributors — in particular CidVonHighwind for the original <Code>EInkDisplay</Code> driver
        and the X3/X4 waveform work, and the community device ports. The register sequences and
        waveform LUTs for the SSD1677 and UC8253 panels are derived from that project.
      </P>
      <P>
        FreeInk is <strong>not a fork</strong> and has no build-time or runtime dependency on the
        upstream repository — it has its own history and its own architecture. Where the upstream
        interleaved every device in one monolithic driver, FreeInk splits each controller into a
        standalone, compile-time-selectable driver behind a stable facade. Full attribution lives in{' '}
        <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/NOTICE">NOTICE</A>.
      </P>

      <Callout title="License">
        <p>
          FreeInk is distributed under the <strong>MIT License</strong> — open source and permissive.
          Use, modify and ship closed-source or commercial derivatives freely. Commercial use is
          welcome and completely free; if FreeInk powers a product you sell, please consider{' '}
          <A href="https://app.royalty.dev/Free-Ink/freeink-sdk">sponsoring the project</A>.
        </p>
      </Callout>
    </>
  )
}
