import { Lead, P, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function BatteryMonitor() {
  return (
    <>
      <Lead>Two backends behind one API: an ADC gauge (default) or an I²C fuel gauge.</Lead>

      <CodeBlock lang="cpp">{`BatteryMonitor(uint8_t adcPin, float dividerMultiplier = 2.0f,
               int8_t chargeStatusPin = PIN_NONE);`}</CodeBlock>

      <P>
        The <strong>ADC</strong> backend reads a divided LiPo voltage off an ADC pin; an optional
        charge-status pin (MCP73832 <Code>/STAT</Code>, active-LOW) drives <Code>isCharging()</Code>.
        The <strong>I²C fuel-gauge</strong> backend (<Code>-DFREEINK_BATTERY_I2C_GAUGE=1</Code>) reads
        SoC / voltage / charge from a BQ27220 gauge (+ optional BQ25896 charger) and ignores the ADC
        pin/divider — used by X3 and the LilyGo T5 S3. Config comes from{' '}
        <Code>BoardConfig::ACTIVE.batteryGauge</Code>, and gauge-vs-ADC is chosen at <em>runtime</em>{' '}
        (gauge address non-zero), so X3 (gauge) and X4 (ADC) work from one C3 binary.
      </P>

      <ApiTable
        rows={[
          ['readPercentage()', 'Estimated charge, 0–100.'],
          ['readPercentageChecked(uint16_t& out) → bool', 'Like readPercentage(), but returns false on a transient I²C-gauge failure and leaves out unchanged (caller keeps its last good value). The ADC path always succeeds.'],
          ['readMillivolts()', 'Battery voltage in mV.'],
          ['readVolts()', 'Battery voltage in volts.'],
          ['isCharging()', 'Charge-sense / charger state.'],
          ['percentageFromMillivolts(mv)', 'Static mV → percentage curve.'],
        ]}
      />
    </>
  )
}
