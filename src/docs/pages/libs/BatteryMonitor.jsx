import { Lead, CodeBlock, ApiTable } from '../../prose.jsx'

export default function BatteryMonitor() {
  return (
    <>
      <Lead>ADC battery gauge with optional charge-sense.</Lead>

      <CodeBlock lang="cpp">{`BatteryMonitor(uint8_t adcPin, float dividerMultiplier = 2.0f,
               int8_t chargeStatusPin = PIN_NONE);`}</CodeBlock>

      <ApiTable
        rows={[
          ['readPercentage()', 'Estimated charge, 0–100.'],
          ['readMillivolts()', 'Battery voltage in mV.'],
          ['isCharging()', 'Charge-sense pin state (if wired).'],
          ['percentageFromMillivolts(mv)', 'Static mV → percentage curve.'],
        ]}
      />
    </>
  )
}
