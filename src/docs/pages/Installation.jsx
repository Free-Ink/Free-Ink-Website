import { Lead, P, H2, A, Ul, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Installation() {
  return (
    <>
      <Lead>
        FreeInk integrates with PlatformIO. Two sample configs in the repository are ready to copy —
        one for greenfield projects and one for dropping the SDK into an existing CrossPoint checkout.
      </Lead>

      <H2>Sample configurations</H2>
      <Ul>
        <Li>
          <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/platformio.sample.ini">
            <Code>platformio.sample.ini</Code>
          </A>{' '}
          — a complete, ready-to-copy configuration. It mirrors the toolchain and flags verified
          against the CrossPoint firmware and includes per-device build envs (<Code>xteink</Code>,{' '}
          <Code>xteink_x4</Code>, <Code>m5paper</Code>, <Code>delink</Code>, <Code>murphy</Code>) wired
          with the right <Code>FREEINK_DEVICE_*</Code> flags.
        </Li>
        <Li>
          <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/platformio.crosspoint.sample.ini">
            <Code>platformio.crosspoint.sample.ini</Code>
          </A>{' '}
          — mirrors the exact working CrossPoint setup.
        </Li>
      </Ul>

      <H2>The minimum: symlinked lib_deps</H2>
      <P>
        At minimum, add the libraries you need as symlink <Code>lib_deps</Code>. The names match the
        original SDK, so existing firmware compiles unchanged:
      </P>
      <CodeBlock lang="platformio.ini">{`lib_deps =
  BoardConfig=symlink://path/to/freeink-sdk/libs/hardware/BoardConfig
  EInkDisplay=symlink://path/to/freeink-sdk/libs/display/FreeInkDisplay
  InputManager=symlink://path/to/freeink-sdk/libs/hardware/InputManager
  BatteryMonitor=symlink://path/to/freeink-sdk/libs/hardware/BatteryMonitor
  SDCardManager=symlink://path/to/freeink-sdk/libs/hardware/SDCardManager
  ; optional:
  FrontlightManager=symlink://path/to/freeink-sdk/libs/hardware/FrontlightManager
  SecureNet=symlink://path/to/freeink-sdk/libs/network/SecureNet`}</CodeBlock>
      <P>
        <Code>#include &lt;EInkDisplay.h&gt;</Code> and the <Code>EInkDisplay</Code> type keep working
        via the compat shim. The display libs depend on <Code>BoardConfig</Code>; <Code>SdFat</Code> is
        pulled in automatically as a dependency of <Code>SDCardManager</Code>.
      </P>

      <H2>Already on CrossPoint?</H2>
      <P>
        Drop <Code>platformio.crosspoint.sample.ini</Code> into the CrossPoint repo as{' '}
        <Code>platformio.local.ini</Code>, point the paths at your FreeInk SDK checkout, and:
      </P>
      <CodeBlock lang="bash">{`pio run -e default`}</CodeBlock>
      <P>
        builds the X3 + X4 ESP32-C3 binary against this SDK with <strong>no source changes</strong> —
        the compat shim preserves every include path and class name.
      </P>

      <Callout title="Picking devices">
        <p>
          Which devices a binary supports is controlled by <Code>-DFREEINK_DEVICE_*</Code> build
          flags, and capabilities by <Code>-DFREEINK_CAP_*</Code>. See{' '}
          <A href="/docs/build-composition">Build composition</A> for the full flag matrix.
        </p>
      </Callout>
    </>
  )
}
