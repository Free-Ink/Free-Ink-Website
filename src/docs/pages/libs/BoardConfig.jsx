import { Lead, P, H2, A, Code, ApiTable } from '../../prose.jsx'

export default function BoardConfig() {
  return (
    <>
      <Lead>
        The compile-time board descriptions and the runtime-active profile. Drivers read pins,
        geometry and capabilities from <Code>BoardConfig::ACTIVE</Code> — nothing device-specific is
        hardcoded in generic code. See <A href="/docs/architecture">Architecture</A>.
      </Lead>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['ACTIVE', 'The runtime-active BoardProfile (defaults to DEFAULT_DEVICE).'],
          ['selectDevice(Board which) → bool', 'Set ACTIVE to a compiled-in device; false if not included.'],
          ['XTEINK_X4, XTEINK_X3, DE_LINK, M5STACK_PAPER_COLOR, MURPHY_M3', 'Built-in board profiles.'],
          ['BoardProfile.orientation', 'Panel mount transform — NO_FLIP / MIRROR_X / MIRROR_Y / ROTATE_180 (applied in hardware by SSD1677).'],
          ['BoardProfile.sdmmc', 'SdmmcPins for 4-bit SDMMC boards; busWidth 0 = use SPI/SdFat.'],
          ['hasTouch() / hasPwmFrontlight() / hasAudio()', 'Capability queries for the active board.'],
          ['isDeLink() / isMurphyM3() / isM5StackPaperColor()', 'Identity queries.'],
          ['LILYGO_T5_PRO_GT911', 'Ready-made GT911 touch config for a future LilyGo profile.'],
        ]}
      />

      <P>
        Adding a board means adding a profile here, not editing generic code — see{' '}
        <A href="/docs/adding-a-device">Adding a device</A>. For runtime device selection across one
        MCU, see <A href="/docs/build-composition">Build composition</A>.
      </P>
    </>
  )
}
