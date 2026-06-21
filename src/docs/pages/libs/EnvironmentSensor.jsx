import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function EnvironmentSensor() {
  return (
    <>
      <Lead>
        Temperature and relative humidity from a Sensirion SHT40 over I²C, described by{' '}
        <Code>BoardConfig::ACTIVE.sensors</Code>. Gated by <Code>FREEINK_CAP_TEMP_HUMIDITY</Code>, which
        defaults on for the <A href="/docs/devices">Sticky</A> and off elsewhere; inert on boards with no
        sensor.
      </Lead>

      <P>
        <Code>read()</Code> runs a single high-precision measurement, validates the SHT40's per-value
        CRC-8, converts the raw 16-bit codes to physical units (°C and %RH, humidity clamped to
        0–100), and returns false on an I²C error or a CRC mismatch — so a successful read is a checked
        read.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Soft-reset and probe the sensor. False when the board has no sensor or it doesn’t ACK.'],
          ['present() → bool', 'Whether the sensor initialized.'],
          ['read(float& tempC, float& humidityPct) → bool', 'Single-shot high-precision measurement with CRC validation. False on I²C error or CRC mismatch.'],
        ]}
      />

      <CodeBlock lang="cpp">{`EnvironmentSensor env;
if (env.begin()) {
  float tempC, rh;
  if (env.read(tempC, rh)) {
    // ... use tempC and rh ...
  }
}`}</CodeBlock>

      <P>
        The SHT40 shares the sensor I²C bus with the <A href="/docs/lib-rtc">RTC</A> and{' '}
        <A href="/docs/lib-imu">IMU</A>; the board profile selects the bus via{' '}
        <Code>SensorsConfig.i2cBus</Code> on multi-bus SoCs. See <A href="/docs/lib-board">BoardConfig</A>.
      </P>
    </>
  )
}
