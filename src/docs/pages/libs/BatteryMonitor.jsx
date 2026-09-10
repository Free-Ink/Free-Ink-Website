import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function BatteryMonitor() {
  return (
    <>
      <Lead>
        Battery state behind one API, across three backends: an ADC gauge (default), an I²C fuel gauge,
        or the M5PM1 PMIC. The backend is chosen from the board profile, so construction and the public
        methods are identical everywhere.
      </Lead>

      <CodeBlock lang="cpp">{`BatteryMonitor(uint8_t adcPin, float dividerMultiplier = 2.0f,
               int8_t chargeStatusPin = PIN_NONE);`}</CodeBlock>

      <P>
        The <strong>ADC</strong> backend reads a divided LiPo voltage off an ADC pin; an optional
        charge-status pin (MCP73832 <Code>/STAT</Code>, active-LOW) drives <Code>isCharging()</Code>.
        The <strong>I²C fuel-gauge</strong> backend (<Code>-DFREEINK_BATTERY_I2C_GAUGE=1</Code>) reads
        SoC / voltage / charge from the gauge selected by <Code>GaugeType</Code> — a{' '}
        <strong>BQ27220</strong> (+ optional BQ25896 charger) on X3 and the LilyGo T5 S3, a{' '}
        <strong>CW2017</strong> on the X4 Pro and X4 Classic (which re-uploads its 80-byte BATINFO profile
        if the gauge has lost it), or an <strong>AXP2101</strong> PMIC on the Waveshare 3.97″ (whose
        fuel-gauge block reports SoC directly, and which also owns the board's EPD rail) — and ignores the
        ADC pin/divider. Config comes from <Code>BoardConfig::ACTIVE.batteryGauge</Code>, and gauge-vs-ADC
        is chosen at <em>runtime</em> (gauge address non-zero), so X3 (gauge) and X4 (ADC) work from one
        C3 binary.
      </P>
      <P>
        The charge-status pin's polarity is configurable per board
        (<Code>batteryChargeStatusActiveHigh</Code>) — active-LOW open-drain by default, active-HIGH for
        boards that push-pull it (X4 Pro). A board can also name a <strong>charger-enable</strong> pin
        (<Code>PowerConfig.chargeEnable</Code> + polarity), which the SDK latches through deep sleep; the
        Sticky uses it to hold its BQ25616 charger enabled.
      </P>
      <P>
        The <strong>M5PM1</strong> backend is <strong>auto-detected</strong> on the M5{' '}
        <A href="/docs/devices">PaperColor</A> (no flag) — the same PMIC that owns the board's rails also
        reports battery state over the internal I²C bus. It reads <Code>VBAT</Code> for voltage and
        percentage, and watches both the DC input rail (<Code>VIN</Code>) and the bidirectional USB-C
        rail (<Code>5VINOUT</Code>) for external power. The PM1 is a PY32 MCU emulating an I²C slave, so
        reads are bursts with a 500 µs settle between the pointer write and the data phase (skip it and
        the slave serves stale samples — e.g. VBAT at 150 mV). It exposes no separate charge-phase bit,
        so <Code>charging</Code> stays unknown there.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['readStatus() → Status', 'Read every battery field the active board can report, in one call. Per-field validity flags distinguish a valid false/zero from unsupported or failed I/O (see below).'],
          ['readPercentage()', 'Estimated charge, 0–100.'],
          ['readPercentageChecked(uint16_t& out) → bool', 'Like readPercentage(), but returns false on a transient I²C-gauge / PMIC failure and leaves out unchanged (caller keeps its last good value). The ADC path always succeeds.'],
          ['readMillivolts() / readVolts()', 'Battery voltage in mV / volts (ADC paths account for the divider).'],
          ['isCharging()', 'Charge state: the ADC charge-status pin, or a charger IC (BQ25896 CHRG_STAT), or — on a gauge board with no charger IC (e.g. X3) — the sign of the gauge’s Current() (BQ27220, positive = charging).'],
          ['percentageFromMillivolts(mv)', 'Static mV → percentage curve.'],
        ]}
      />

      <H2>Status</H2>
      <P>
        <Code>readStatus()</Code> returns a unified <Code>Status</Code> that spans every backend. Because
        some boards can't report some fields — and an I²C read can fail transiently — each value carries
        a <Code>…Known</Code> validity flag, so a valid <Code>false</Code> / <Code>0</Code> is never
        confused with unsupported or failed I/O. <Code>supported</Code> is <Code>false</Code> when the
        board profile has no battery telemetry path at all.
      </P>
      <ApiTable
        rows={[
          ['supported', 'The board has a battery-telemetry path.'],
          ['percentage / percentageKnown', 'Estimated charge 0–100, and whether it was read.'],
          ['millivolts / millivoltsKnown', 'Battery voltage in mV, and whether it was read.'],
          ['charging / chargingKnown', 'Active-charge state, and whether it is reportable (unknown on the PM1 — no charge-phase bit).'],
          ['externalPower / externalPowerKnown', 'Whether a USB/DC supply is present (PM1: VIN or 5VINOUT above threshold, or the PWR_SRC report).'],
          ['pm1VinMv / pm1VinOutMv / pm1PowerSource', 'Raw M5PM1 diagnostics — DC input mV, USB-C rail mV, and the PWR_SRC field; −1 on non-PM1 boards or failed I/O.'],
        ]}
      />
    </>
  )
}
