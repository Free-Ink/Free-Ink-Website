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
    </>
  )
}
