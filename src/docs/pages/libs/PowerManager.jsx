import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function PowerManager() {
  return (
    <>
      <Lead>
        Portable deep-sleep wake-on-power-button. It picks the SoC-correct wakeup source at compile
        time — RTC <Code>ext1</Code> on Xtensa (S3/S2, classic ESP32) vs the <Code>gpio</Code> source on
        RISC-V (C3/C6/H2) — and reads the wake pin + polarity from{' '}
        <Code>BoardConfig::ACTIVE.input</Code>, so consumers write no chip-specific power code.
      </Lead>

      <P>All methods are static.</P>
      <ApiTable
        rows={[
          ['armPowerButtonWakeup() → bool', 'Arm wake-on-power-button (SoC-correct source + active pin/polarity). False if the board has no power pin.'],
          ['armWakeOnPins(uint64_t gpioMask, bool wakeLow = true)', 'Arm wake on an arbitrary set of GPIOs (a touch INT, a second button, an IO-expander INT) using the SoC-correct source. Pins must be RTC-capable on ext1 (Xtensa) parts.'],
          ['waitForPowerButtonRelease()', 'Poll the power GPIO until released, so sleep isn’t cancelled by a still-held press.'],
          ['deepSleep()', 'Isolate floating GPIOs, then enter deep sleep. Does not return (chip resets on wake).'],
          ['deepSleepUntilPowerButton()', 'Convenience: wait for release, arm wakeup, then deep sleep.'],
          ['powerDownRailsForSleep()', 'Drive every assigned power-rail enable in the profile (display / SD / touch / mic) OFF and latch it with gpio_hold, so gated rails stay off through deep sleep instead of draining milliamps. No-op on boards with no gated rails (X3/X4). Call after the display’s deep-sleep command and before deepSleep(). Cutting the touch rail forfeits touch-to-wake.'],
        ]}
      />

      <H2>Usage</H2>
      <CodeBlock lang="cpp">{`// before — C3-only, breaks on S3:
esp_deep_sleep_enable_gpio_wakeup(1ULL << InputManager::POWER_BUTTON_PIN,
                                  ESP_GPIO_WAKEUP_GPIO_LOW);
esp_deep_sleep_start();

// after — MCU-portable:
freeink::PowerManager::armPowerButtonWakeup();
esp_deep_sleep_start();`}</CodeBlock>
      <P>
        It compiles on both targets — the <Code>gpio</Code> branch links in the C3 build, the{' '}
        <Code>ext1</Code> branch in the S3 build. For the why and a consumer porting checklist, see{' '}
        <A href="/docs/mcu-portability">MCU portability</A>.
      </P>
    </>
  )
}
