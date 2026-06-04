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
        its default capabilities. You can compose any set that shares an MCU — a C3-vs-S3 mix is a
        compile error.
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
          [<em key="f">(none)</em>, <>defaults from the legacy <Code>-DBOARD_*</Code> macro, else X3 + X4</>],
        ]}
      />
      <P>
        Multiple different-pinout devices on one MCU are runtime-selected: <Code>ACTIVE</Code> defaults
        to a compile-time default and the consumer calls <Code>BoardConfig::selectDevice(...)</Code>{' '}
        after its own detection. The SDK doesn't ship a detector — X3/X4 detection stays in the
        consumer (e.g. CrossPoint's I2C fingerprint).
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
          [<Code key="d">FREEINK_CAP_AUDIO</Code>, 'audio output (scaffold)', 'off'],
          [<Code key="e">FREEINK_CAP_NET_TLS13</Code>, <>wolfSSL TLS 1.3 (≡ <Code>FREEINK_NET_WOLFSSL</Code>)</>, 'off'],
        ]}
      />

      <H2>Other flags</H2>
      <Table
        head={['Flag', 'Effect']}
        rows={[
          [
            <Code key="a">-DBOARD_DELINK / _M5STACK_PAPERCOLOR / _MURPHY_M3</Code>,
            <>legacy single-device selection (maps to the matching <Code>FREEINK_DEVICE_*</Code>)</>,
          ],
          [
            <Code key="b">-DFREEINK_DISPLAY_FLIPPED</Code>,
            <>(or <Code>-DFLIPPED</Code>) back-compat alias for <Code>BoardProfile.orientation = MIRROR_Y</Code> on SSD1677</>,
          ],
          [
            <Code key="sd">-DFREEINK_SD_SDMMC=1</Code>,
            <>use the native 4-bit SDMMC backend (needs <Code>-DUSE_BLOCK_DEVICE_INTERFACE=1</Code>); auto-on for de-link</>,
          ],
          [
            <Code key="c">-DEINK_DISPLAY_SINGLE_BUFFER_MODE=1</Code>,
            'single framebuffer (uses controller RAM as the previous frame)',
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
