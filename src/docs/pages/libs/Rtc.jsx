import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Rtc() {
  return (
    <>
      <Lead>
        Wall-clock time from a PCF8563 real-time clock over I²C, described by{' '}
        <Code>BoardConfig::ACTIVE.sensors</Code>. Gated by <Code>FREEINK_CAP_RTC</Code>, which defaults
        on for the <A href="/docs/devices">Sticky</A> and off elsewhere; inert on boards with no RTC.
      </Lead>

      <P>
        <Code>begin()</Code> brings up the I²C bus and disables the chip's CLKOUT; <Code>now()</Code>{' '}
        and <Code>set()</Code> read and write a <Code>DateTime</Code>. The driver handles the BCD
        register encoding and the oscillator-stopped flag, so a <Code>now()</Code> that returns false
        means the clock was never set (or browned out) rather than a silent bad time.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Bring up the bus, disable CLKOUT. False when the board has no RTC or it doesn’t ACK.'],
          ['present() → bool', 'Whether the RTC initialized.'],
          ['now(DateTime& out) → bool', 'Read the current time. False on I²C error or if the oscillator reports stopped (never set / low voltage).'],
          ['set(const DateTime& dt) → bool', 'Set the clock. False on I²C error.'],
          ['DateTime { year, month, day, hour, minute, second, weekday }', 'Full year (e.g. 2026), 1-based month/day, 24h time, weekday 0=Sunday.'],
        ]}
      />

      <CodeBlock lang="cpp">{`Rtc rtc;
if (rtc.begin()) {
  Rtc::DateTime t;
  if (rtc.now(t)) {
    // ... use t.year / t.month / t.hour ...
  }
}`}</CodeBlock>

      <P>
        The PCF8563 shares the sensor I²C bus with the temperature/humidity sensor and IMU. On
        multi-bus SoCs the board profile picks <Code>Wire</Code> or <Code>Wire1</Code> via{' '}
        <Code>SensorsConfig.i2cBus</Code> — on the Sticky the sensor cluster sits on a second bus, away
        from the touch controller. See <A href="/docs/lib-board">BoardConfig</A>.
      </P>
    </>
  )
}
