import { Lead, Code, ApiTable } from '../../prose.jsx'

export default function Frontlight() {
  return (
    <>
      <Lead>
        PWM frontlight with warm/cool control (e.g. de-link). Gated by{' '}
        <Code>FREEINK_CAP_FRONTLIGHT</Code>; inert on boards without a frontlight.
      </Lead>

      <ApiTable
        rows={[
          ['begin()', 'Set up the PWM channel.'],
          ['on() / off()', 'Toggle the light.'],
          ['setBrightness(uint8_t percent)', 'Brightness 0–100.'],
          ['setColorTemperature(uint8_t warmPercent)', 'Warm/cool mix 0–100.'],
          ['present() / brightness()', 'Whether a frontlight exists; current brightness.'],
        ]}
      />
    </>
  )
}
