import { Lead, P, H2, A, Ul, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function McuPortability() {
  return (
    <>
      <Lead>
        The FreeInk SDK is MCU-agnostic: every library compiles cleanly on both ESP32-C3 (X3/X4) and
        ESP32-S3 (de-link, M5, Murphy, LilyGo T5 S3). Pins, geometry, waveforms, SD transport and orientation all
        come from <Code>BoardConfig::ACTIVE</Code> or per-driver config, so the SDK never hardcodes a
        chip.
      </Lead>

      <P>
        The one hardware concern that used to leak to the consumer is the per-SoC deep-sleep GPIO
        wakeup difference: RISC-V parts (C3/C6/H2) wake via the <Code>gpio</Code> source, while Xtensa
        parts (S3/S2, classic ESP32) wake via RTC <Code>ext1</Code>. Hardcoding either one blocks a
        multi-MCU build. The SDK now owns this through <Code>PowerManager</Code>.
      </P>

      <H2>Deep sleep with PowerManager</H2>
      <P>
        <Code>PowerManager</Code> picks the SoC-correct wakeup source at compile time and reads the wake
        pin + polarity from <Code>BoardConfig::ACTIVE.input</Code>, so the same code deep-sleeps
        correctly on every supported board:
      </P>
      <CodeBlock lang="cpp">{`// before — C3-only, breaks on S3:
esp_deep_sleep_enable_gpio_wakeup(1ULL << InputManager::POWER_BUTTON_PIN,
                                  ESP_GPIO_WAKEUP_GPIO_LOW);
esp_deep_sleep_start();

// after — MCU-portable:
freeink::PowerManager::armPowerButtonWakeup();
esp_deep_sleep_start();`}</CodeBlock>
      <P>
        It compiles on both targets — the <Code>gpio</Code> branch links in the C3 build, the{' '}
        <Code>ext1</Code> branch in the S3 build. See the full surface in the{' '}
        <A href="/docs/lib-power">PowerManager reference</A>.
      </P>

      <H2>Read pins from the runtime profile</H2>
      <P>
        <Code>InputManager::POWER_BUTTON_PIN</Code> is the <em>compile-time default device's</em> pin —
        correct for a single-device binary, but for an X3 + X4 (or any multi-device) build the live pin
        is <Code>BoardConfig::ACTIVE.input.power</Code>. Read the wake pin, and any other board pin,
        from <Code>BoardConfig::ACTIVE</Code>, which the SDK populates per board.
      </P>

      <Callout title="Porting an existing consumer?">
        <p>
          A consumer can still block a multi-MCU build with chip-specific code in <em>its own</em>{' '}
          layer — e.g. a RISC-V-only panic backtrace or a hardcoded flash pin. None of those are SDK
          changes. The SDK repo's{' '}
          <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/docs/consumer-mcu-portability.md">
            consumer MCU-portability guide
          </A>{' '}
          walks through each one (worked against CrossPoint's HAL).
        </p>
      </Callout>

      <H2>Related</H2>
      <Ul>
        <Li>
          <A href="/docs/build-composition">Build composition</A> — composing a binary across devices
          that share an MCU.
        </Li>
        <Li>
          <A href="/docs/adding-a-device">Adding a device</A> — board profiles and per-device build envs.
        </Li>
      </Ul>
    </>
  )
}
