import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Imu() {
  return (
    <>
      <Lead>
        6-axis motion from an ST LSM6DS3TR-C accelerometer + gyroscope over I²C, described by{' '}
        <Code>BoardConfig::ACTIVE.sensors</Code>. Gated by <Code>FREEINK_CAP_IMU</Code>, which defaults
        on for the <A href="/docs/devices">Sticky</A> and off elsewhere; inert on boards with no IMU.
      </Lead>

      <P>
        <Code>begin()</Code> checks the <Code>WHO_AM_I</Code> id and configures both sensors at 104 Hz
        (accel ±2 g, gyro ±245 dps). <Code>read()</Code> returns one <Code>Sample</Code> already scaled
        to physical units — acceleration in g and angular rate in degrees/second — so the app gets
        usable values without touching raw LSB scaling.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Probe WHO_AM_I and configure accel + gyro. False when the board has no IMU or the part doesn’t identify.'],
          ['present() → bool', 'Whether the IMU initialized.'],
          ['read(Sample& out) → bool', 'Read one accel + gyro sample. False on I²C error.'],
          ['Sample { ax, ay, az, gx, gy, gz }', 'Acceleration in g; angular rate in °/s.'],
        ]}
      />

      <CodeBlock lang="cpp">{`Imu imu;
if (imu.begin()) {
  Imu::Sample s;
  if (imu.read(s)) {
    // ... s.ax/ay/az (g), s.gx/gy/gz (deg/s) ...
  }
}`}</CodeBlock>

      <P>
        Fixed 104 Hz output, no dynamic rate selection. The IMU shares the sensor I²C bus with the{' '}
        <A href="/docs/lib-rtc">RTC</A> and <A href="/docs/lib-env">EnvironmentSensor</A>; the board
        profile picks the bus via <Code>SensorsConfig.i2cBus</Code> on multi-bus SoCs. See{' '}
        <A href="/docs/lib-board">BoardConfig</A>.
      </P>
    </>
  )
}
