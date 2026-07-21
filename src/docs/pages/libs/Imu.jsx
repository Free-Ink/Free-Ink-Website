import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Imu() {
  return (
    <>
      <Lead>
        6-axis motion (accelerometer + gyroscope) over I²C, described by{' '}
        <Code>BoardConfig::ACTIVE.sensors</Code>. Two chips are supported, selected per board by{' '}
        <Code>ImuType</Code>: the ST <strong>LSM6DS3TR-C</strong> (Sticky) and the{' '}
        <strong>QMI8658</strong> (Xteink X3). Gated by <Code>FREEINK_CAP_IMU</Code>, which defaults on
        for the <A href="/docs/devices">X3</A> and Sticky, and off elsewhere; inert on boards with no IMU.
      </Lead>

      <P>
        <Code>begin()</Code> checks the <Code>WHO_AM_I</Code> id and configures accel + gyro for the
        board's chip (LSM6DS3TR-C at 104 Hz, ±2 g / ±245 dps; QMI8658 at 28 Hz, ±2 g / ±512 dps).{' '}
        <Code>read()</Code> returns one <Code>Sample</Code> already scaled to physical units —
        acceleration in g and angular rate in degrees/second — so the app gets usable values regardless
        of which part is fitted.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Probe WHO_AM_I and configure accel + gyro. False when the board has no IMU or the part doesn’t identify.'],
          ['present() → bool', 'Whether the IMU initialized.'],
          ['read(Sample& out) → bool', 'Read one accel + gyro sample. False on I²C error.'],
          ['sleep() / wake() → bool', 'Power the sensor down / back up. Config is retained, so wake() resumes sampling without a full begin().'],
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
        Fixed output rate per chip, no dynamic rate selection. The IMU shares the sensor I²C bus with
        the <A href="/docs/lib-rtc">RTC</A> and <A href="/docs/lib-env">EnvironmentSensor</A>; the board
        profile picks the bus via <Code>SensorsConfig.i2cBus</Code> on multi-bus SoCs. See{' '}
        <A href="/docs/lib-board">BoardConfig</A>.
      </P>
    </>
  )
}
