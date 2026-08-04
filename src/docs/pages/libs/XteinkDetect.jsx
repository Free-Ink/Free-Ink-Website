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

      <H2>Board fingerprint (X3 vs X4)</H2>
      <ApiTable
        rows={[
          ['detectXteinkIsX3() → bool', 'Run the X3 I²C fingerprint and return true for an X3. Leaves the bus released and the probe pins back in INPUT mode; safe to call before any other bring-up.'],
          ['detectXteinkVerdict(&score1, &score2) → XteinkVerdict', 'The same probe with a three-way verdict — X3Confirmed / X4Confirmed / Inconclusive — plus the per-pass chip-hit scores (0–3) for diagnostics. Inconclusive means the passes disagreed or saw a stray ACK: treat it as an X4, but don’t persist a flaky first boot.'],
          ['selectXteinkDevice() → bool', 'Convenience: run the fingerprint, point BoardConfig::ACTIVE at the matching profile via selectDevice(), and return whether an X3 was detected. On a confirmed X3 it also runs the display-controller probe, selecting the UC8279 sibling profile when that silicon is fingerprinted.'],
        ]}
      />

      <H2>Display-controller sibling probe</H2>
      <P>
        Newer production runs swap the default controller for an UltraChip sibling that shares the
        UC81xx KW-mode command set: the X3's <Code>UC8253</Code> → <Code>UC8279d</Code>, and the{' '}
        <strong>X4 Pro's</strong> <Code>SSD1677</Code> → <Code>UC8179</Code>. Same board, glass and
        pinout — only the silicon differs, so the running firmware fingerprints the live display bus
        and selects the matching driver before <A href="/docs/lib-display">FreeInkDisplay::begin()</A>.
      </P>
      <ApiTable
        rows={[
          ['detectXteinkDisplayController(verBytes[5], &flg) → DisplayControllerVerdict', 'Board-agnostic probe: reads VER (0x70) / FLG (0x71) over a bit-banged half-duplex 4-wire SPI on BoardConfig::ACTIVE’s display pins, after a reset pulse. A matching UC81xx signature across two passes → Uc81xxConfirmed, else PrimaryAssumed. Works on any Xteink profile, including the S3 X4 Pro where the X3 I²C probe would be unsafe.'],
          ['detectX3DisplayController(verBytes[5], &flg) → X3DisplayVerdict', 'The X3-specific variant (hard-coded X3 C3 pinout): Uc8253Assumed / Uc8279Confirmed / Inconclusive.'],
          ['applyXteinkDisplayController() → bool', 'Resolve the panel controller from the live bus probe and, on a confirmed sibling, promote BoardConfig::ACTIVE.displayController (SSD1677 → UC8179, UC8253 → UC8279) so begin() picks the matching driver. Returns true iff promoted. The OEM NVS screenType is read only for diagnostics — the live probe is the ground truth, since a cross-unit flash can name the wrong panel.'],
          ['getXteinkDisplayProbeDiag() → const XteinkDisplayProbeDiag&', 'Snapshot of the most recent probe (VER/FLG bytes, verdict, whether it promoted, and up to 48 bytes of controller MTP) for firmware to persist somewhere retrievable without serial access — e.g. a file on the SD card of a locked unit.'],
        ]}
      />

      <CodeBlock lang="cpp">{`#include <XteinkDetect.h>

// Before SDCardManager::begin() and FreeInkDisplay::begin(), so both read the
// right profile:
if (freeink::selectXteinkDevice()) {
  display.setDisplayX3();   // detected an X3
}
freeink::applyXteinkDisplayController();   // promote to the UC81xx sibling if present
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
