import { Lead, P, H2, A, Ul, Li, Code, CodeBlock } from '../prose.jsx'

export default function Architecture() {
  return (
    <>
      <Lead>
        The firmware calls one generic API. Underneath, a facade owns the framebuffer and geometry and
        delegates every panel operation to a per-controller driver, which talks to the panel over a
        shared bus helper. Device specifics are injected, never hardcoded.
      </Lead>

      <CodeBlock>{`firmware  ─calls─▶  EInkDisplay  (alias of freeink::FreeInkDisplay, the facade)
                          │ owns framebuffer + geometry, selects a driver at begin()
                          ▼
                    PanelDriver  (interface)
              ┌───────────┼───────────────┬───────────────┐
        Ssd1677Driver  Uc8253X3Driver  Ed2208M5Driver  Uc8253MurphyDriver
         (X4/de-link)     (X3)          (M5, stub)       (Murphy, stub)
                          │  all share
                          ▼
                       EpdBus  (SPI/GPIO framing, BUSY polarity, reset, mirror)`}</CodeBlock>

      <H2>FreeInkDisplay — the facade</H2>
      <P>
        Exposed to firmware as <Code>EInkDisplay</Code>, the facade owns the framebuffer(s) and
        geometry and delegates every panel operation to a <Code>PanelDriver</Code>. It preserves the
        full public API, including:
      </P>
      <Ul>
        <Li>
          The <Code>FULL_REFRESH</Code> / <Code>HALF_REFRESH</Code> / <Code>FAST_REFRESH</Code> modes.
        </Li>
        <Li>
          The grayscale / anti-aliased dual-plane path —{' '}
          <Code>copyGrayscaleBuffers</Code> → <Code>displayGrayBuffer</Code>,{' '}
          <Code>writeGrayscalePlaneStrip</Code>.
        </Li>
      </Ul>

      <H2>PanelDriver — one per controller</H2>
      <P>
        Each controller has one driver implementation, in its own file. A driver owns its register
        sequences and cross-call state, and takes its waveforms, LUTs and tunables as an injected{' '}
        <strong>config</strong> (e.g. <Code>Ssd1677Config</Code>, <Code>Uc8253X3Config</Code>) — so
        per-device tuning is data, not code. A driver doesn't even have to emit raw SPI; it can wrap a
        third-party display library. See <A href="/docs/adding-a-device">Adding a device</A>.
      </P>

      <H2>EpdBus — the shared bus helper</H2>
      <P>
        A shared SPI/GPIO helper, parameterized by SPI clock and BUSY polarity. Each controller sets a
        default, overridable per board via <Code>BoardConfig::ACTIVE.displaySpiHz</Code>. It handles
        framing, BUSY polling, reset and mirroring.
      </P>

      <H2>BoardConfig — the device description</H2>
      <P>
        The one compile-time-selected description of a device: pins, geometry, controller, input
        style, touch, frontlight and audio.
      </P>

      <H2>Nothing device-specific is hardcoded in generic code</H2>
      <P>
        GPIOs come from the <Code>EInkDisplay</Code> constructor (firmware passes{' '}
        <Code>BoardConfig::ACTIVE.display.*</Code>) and from <Code>BoardConfig</Code>. SPI clocks have a
        controller default and a board override. Waveforms, LUTs, booster values, scan direction and
        refresh temperatures are injected via the driver config struct. A new device fills in values;
        the generic driver consumes them.
      </P>
    </>
  )
}
