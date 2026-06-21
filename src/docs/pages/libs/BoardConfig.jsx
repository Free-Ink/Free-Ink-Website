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
          ['XTEINK_X4, XTEINK_X3, DE_LINK, M5STACK_PAPER_COLOR, MURPHY_M3, LILYGO_T5S3, M5PAPER_V11, STICKY', 'Built-in board profiles.'],
          ['BoardProfile.orientation', 'Panel mount transform — NO_FLIP / MIRROR_X / MIRROR_Y / ROTATE_180 (applied in hardware by SSD1677).'],
          ['BoardProfile.sdmmc', 'SdmmcPins for 4-bit SDMMC boards; busWidth 0 = use SPI/SdFat.'],
          ['BoardProfile.uiScale', 'Per-device UI scale multiplier (1.0 default; touch boards like Sticky bump it for finger-sized chrome). Read by the app/theme layer.'],
          ['hasTouch() / hasPwmFrontlight() / hasAudio()', 'Capability queries for the active board.'],
          ['isDeLink() / isMurphyM3() / isM5StackPaperColor() / isM5PaperV11()', 'Identity queries.'],
          ['LILYGO_T5_PRO_GT911', 'Ready-made GT911 touch config (used by the LilyGo T5 S3 profile).'],
        ]}
      />

      <H2>Peripheral config</H2>
      <P>
        Each peripheral library reads a small config struct off <Code>ACTIVE</Code>, so nothing
        peripheral-specific is hardcoded in generic code:
      </P>
      <ApiTable
        rows={[
          ['TouchConfig', 'Controller, pins, raw axis ranges, swapXY / flipX / flipY digitizer correction, and an optional powerEnable rail. See InputManager.'],
          ['MicConfig', 'PDM mic: input type, clock/data pins, and an active-polarity enable pin. See Microphone.'],
          ['SensorsConfig', 'Shared I²C sensor bus (SDA/SCL/Hz) + the RTC / temp-humidity / IMU addresses (0 = absent), driving Rtc / EnvironmentSensor / Imu.'],
          ['AudioConfig.buzzer', 'LEDC PWM pin for a passive buzzer (Buzzer), separate from the I2S codec fields.'],
          ['DisplayPins.powerEnable / SdPins.powerEnable', 'Active-high rails for the panel and SD card, raised at begin() with a settle delay (PIN_UNASSIGNED = always powered).'],
          ['i2cBus (gauge & sensors)', 'On multi-bus SoCs (ESP32-S3), select Wire (0) or Wire1 (1) per peripheral so e.g. touch and sensors stay on separate physical buses.'],
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
