import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function XteinkDetect() {
  return (
    <>
      <Lead>
        Runtime Xteink X3/X4 detection. The X3 and X4 are two board profiles compiled into one
        ESP32-C3 binary; this library supplies the canonical I²C fingerprint so a dual X3/X4 firmware
        picks the right one before bringing up the display and SD card.
      </Lead>

      <P>
        X3 and X4 share a pinout but differ in panel controller (X3 = UC8253 792×528, X4 = SSD1677
        800×480) and battery backend, so the running firmware must select a profile at boot. The SDK
        leaves detection to the consumer by design — but rather than have every dual app reinvent the
        fingerprint, <Code>XteinkDetect</Code> ships the known-good one. See{' '}
        <A href="/docs/build-composition">Build composition</A> for how one binary carries both profiles.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['detectXteinkIsX3() → bool', 'Run the X3 I²C fingerprint and return true for an X3. Leaves the bus released and the probe pins back in INPUT mode; safe to call before any other bring-up.'],
          ['selectXteinkDevice() → bool', 'Convenience: run the fingerprint, point BoardConfig::ACTIVE at the matching profile via selectDevice(), and return whether an X3 was detected (so the caller can put the display in X3 mode).'],
        ]}
      />

      <CodeBlock lang="cpp">{`#include <XteinkDetect.h>

// Before SDCardManager::begin() and FreeInkDisplay::begin(), so both read the
// right profile:
if (freeink::selectXteinkDevice()) {
  display.setDisplayX3();   // detected an X3
}
display.begin();`}</CodeBlock>

      <H2>How it fingerprints</H2>
      <P>
        Detection probes the <strong>X3-only I²C peripherals</strong> on <Code>SDA=20 / SCL=0</Code> — the
        BQ27220 fuel gauge (<Code>0x55</Code>), DS3231 RTC (<Code>0x68</Code>) and QMI8658 IMU
        (<Code>0x6B</Code> / <Code>0x6A</Code>). The X4 has none of them, so two passes that each score{' '}
        <strong>≥ 2 hits</strong> confirm an X3; anything else is treated as an X4 — the conservative
        default. Call it before any other hardware bring-up, then hand off to{' '}
        <A href="/docs/lib-display">FreeInkDisplay</A> and <A href="/docs/lib-sd">SDCardManager</A>.
      </P>
    </>
  )
}
