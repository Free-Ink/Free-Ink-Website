import { Lead, P, H2, A, Code, ApiTable } from '../../prose.jsx'

export default function Frontlight() {
  return (
    <>
      <Lead>
        Frontlight with warm/cool control (e.g. de-link). Gated by{' '}
        <Code>FREEINK_CAP_FRONTLIGHT</Code>; inert on boards without a frontlight. Most boards drive the
        LEDs with LEDC PWM; the <A href="/docs/devices">EEGO A4</A> instead drives an{' '}
        <strong>LM3630A over I²C</strong>, selected from the board profile
        (<Code>I2cFrontlightController</Code>), so the same API works either way.
      </Lead>

      <ApiTable
        rows={[
          ['begin()', 'Set up the PWM channel (or bring up the I²C controller).'],
          ['on() / off()', 'Toggle the light.'],
          ['setBrightness(uint8_t percent)', 'Brightness 0–100, mapped through a perceptual gamma curve (≈1.66) so equal steps look evenly spaced rather than crowding at the top.'],
          ['setColorTemperature(uint8_t warmPercent)', 'Warm/cool mix 0–100.'],
          ['present() / brightness()', 'Whether a frontlight exists; current brightness. On the EEGO A4 the backlight is optional per unit, so present() reflects a runtime I²C probe.'],
        ]}
      />

      <H2>Light sleep</H2>
      <P>
        Under <Code>-DFREEINK_FRONTLIGHT_LS</Code> the LEDC channel runs off the always-on{' '}
        <Code>RC_FAST</Code> clock so the light can stay lit through a light-sleep tick. For deep sleep,{' '}
        <Code>park()</Code> drives the LED pads low and holds them there across the sleep (cutting leakage
        through the driver), and <Code>releaseOnWake()</Code> releases that hold unconditionally at boot.
      </P>
      <ApiTable
        rows={[
          ['park()', 'Drive the frontlight pads low and gpio-hold them through deep sleep. Requires FREEINK_FRONTLIGHT_LS.'],
          ['releaseOnWake()', 'Release the sleep hold at boot before normal use. Requires FREEINK_FRONTLIGHT_LS.'],
        ]}
      />
    </>
  )
}
