import { Lead, P, H2, A, Code, CodeBlock, ApiTable, Callout } from '../../prose.jsx'

export default function RecoveryBoot() {
  return (
    <>
      <Lead>
        A boot-time recovery hatch. Call <Code>recovery::checkBootCombo()</Code> as the very first thing
        in <Code>setup()</Code> of every firmware you want to be escapable; holding{' '}
        <strong>Back + Up</strong> at reset repoints OTA at slot 0 and reboots into the recovery
        firmware.
      </Lead>

      <P>
        The stock Xteink (and most ESP32) second-stage bootloader can't read buttons — it just boots
        whatever <Code>otadata</Code> selects. So "hold a combo at reset to fall back to recovery" can
        only be honoured by the firmware that actually boots. This library is that check, made shareable:
        the recovery flasher, the editor, the reader and so on each call it first, so any of them can
        bail out to the escape hatch.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['checkBootCombo()', 'Read the recovery combo and, if held, switch otadata to OTA slot 0 and reboot. Returns immediately (no reboot) in every other case.'],
          ['checkBootCombo(const SdUpdateOptions& options)', 'Combo-latched SD update: when the combo is held, flash options.path (default /update.bin) into the next OTA slot and reboot into it; with no file present — or on flash failure — falls back to the plain slot-0 hatch. Latches the board’s power rails itself so a released power button can’t cut power mid-flash.'],
          ['switchBootPartition(const esp_partition_t* dest) → bool', 'Point the bootloader at dest by writing a fresh otadata entry (bypasses esp_image_verify, which rejects patched vendor images). Does not reboot.'],
        ]}
      />
      <CodeBlock lang="cpp">{`#include <RecoveryBoot.h>

void setup() {
  freeink::recovery::checkBootCombo();   // FIRST — Back+Up at reset → recovery
  // ... normal firmware init ...
}`}</CodeBlock>

      <P>
        It is always safe to call unconditionally and early — it does nothing unless <strong>all</strong>{' '}
        of: the combo is pressed, OTA slot 0 holds a valid app image, and the caller isn't already
        running from slot 0 (so inside the recovery firmware it's a no-op). When it does act it reboots
        and never returns. The convention is that the recovery / escape-hatch firmware lives in{' '}
        <strong>OTA slot 0</strong> (<Code>ota_0</Code>, the default upload offset <Code>0x10000</Code>).
        The otadata switch is self-contained and skips <Code>esp_image_verify</Code>, so it works with
        patched Xteink images.
      </P>

      <Callout title="What it can't do" tone="warn">
        <p>
          It can't escape a firmware that crashes in ROM or early SDK init <em>before</em> this call is
          reached. A corrupt app <em>image</em> is still caught for free — the bootloader falls back to
          the other OTA slot on its own. Truly unconditional GPIO recovery would need a custom
          second-stage bootloader, which the recovery firmware deliberately never reflashes.
        </p>
      </Callout>

      <H2>SD-card firmware flasher</H2>
      <P>
        The same library ships a standalone <strong>SD-card firmware flasher</strong>{' '}
        (<Code>freeink::firmware</Code>, <Code>FirmwareFlasher.h</Code>) — the engine behind the{' '}
        <Code>SdUpdateOptions</Code> combo, also callable directly for an in-app "update from SD" flow.
        It streams an ESP32 app image from an SD path into the next OTA partition with interleaved 64 KiB
        erase + writes, then repoints <Code>otadata</Code>; the caller restarts. It deliberately avoids the
        Arduino <Code>Update</Code> class and <Code>esp_image_verify</Code> (which reject patched vendor
        images) and runs its own full integrity pass instead.
      </P>
      <ApiTable
        rows={[
          ['validateImageFile(const char* sdPath, size_t partitionSize) → Result', 'Bootloader-equivalent integrity check before flashing: header magic, chip_id vs the running MCU, segment-table walk, XOR checksum, and SHA256 trailer. Streams in small chunks (C3-safe). Pass partitionSize 0 to skip the fits-partition check.'],
          ['flashFromSdPath(const char* sdPath, ProgressCb onProgress = nullptr, void* ctx = nullptr, bool alreadyValidated = false) → Result', 'Validate (unless already done), then stream the image into the next OTA slot and switch otadata. The card must be mounted first; the caller reboots on OK.'],
          ['runningPartitionChipId() → uint16_t', 'chip_id of the currently-running image (0xFFFF if unreadable) — the authoritative CPU match a candidate image must satisfy.'],
          ['resultName(Result) → const char*', 'Human name for a Result (OK, BAD_MAGIC, BAD_SHA, BAD_CHIP, NO_PARTITION, WRITE_FAIL, …).'],
        ]}
      />
      <Callout title="Requires the SD card mounted">
        <p>
          Call <Code>SDCardManager::begin()</Code> before any flasher call. The image is validated against
          the running MCU family, so a truncated, corrupted, or wrong-chip <Code>.bin</Code> never reaches{' '}
          <Code>otadata</Code>.
        </p>
      </Callout>
    </>
  )
}
