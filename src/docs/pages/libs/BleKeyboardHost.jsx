import { Lead, P, H2, A, Code, CodeBlock, ApiTable, Callout } from '../../prose.jsx'

export default function BleKeyboardHost() {
  return (
    <>
      <Lead>
        A Bluetooth Low Energy <strong>HID host</strong>: it pairs with and connects to one BLE HID
        peripheral at a time (central role) and hands firmware translated key events — for keyboards,
        page turners, remote buttons and similar devices that expose the HID service{' '}
        (<Code>0x1812</Code>). The class keeps the <Code>BleKeyboardHost</Code> name; new code uses the{' '}
        <Code>BleHid</Code> accessor (<Code>BleKbd</Code> remains as an alias).
      </Lead>

      <Callout title="BLE only" tone="warn">
        <p>
          The ESP32-C3 / S3 has no Bluetooth Classic (BR/EDR) radio, so Classic-only HID devices cannot
          connect. The library is also ESP32-C3/S3-only — it needs a BLE radio.
        </p>
      </Callout>

      <H2>Enabling it</H2>
      <P>
        It's an opt-in <strong>capability</strong>, gated on <Code>FREEINK_CAP_BLE_HID_HOST</Code>{' '}
        (default off). When off it links stub bodies and pulls in <strong>no</strong> BLE code, so
        disabled builds stay lean. Turn it on with the flag <em>and</em> add the NimBLE stack to{' '}
        <Code>lib_deps</Code> (it's intentionally not a hard dependency). The older{' '}
        <Code>FREEINK_CAP_BLE_KEYBOARD</Code> flag still maps to it. See{' '}
        <A href="/docs/build-composition">Build composition</A>.
      </P>
      <CodeBlock>{`build_flags =
  -DFREEINK_CAP_BLE_HID_HOST=1
  -DFREEINK_BLE_HID_SHOW_UNNAMED_DEVICES=0   ; hide anonymous non-HID advertisers
  -DCONFIG_BT_NIMBLE_ROLE_CENTRAL=1          ; central-only, 1 connection
  -DCONFIG_BT_NIMBLE_MAX_CONNECTIONS=1
lib_deps =
  BleKeyboardHost=symlink://freeink-sdk/libs/network/BleKeyboardHost
  h2zero/NimBLE-Arduino@^2.3.8`}</CodeBlock>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin(const char* name)', 'Init the NimBLE central + bonding and load NVS bonds.'],
          ['poll()', 'Drive auto-reconnect and key auto-repeat; call each loop.'],
          ['popKey(KeyEvent& ev) → bool', 'Drain the next translated key. ev.special is a SpecialKey (PageDown, arrows…); ev.ch is printable input.'],
          ['startScan(uint32_t ms) / deviceCount() / device(i)', 'Scan for peripherals; each DiscoveredDevice carries addr, name, rssi, hid, connectable (and hasName).'],
          ['connect(addr) / isConnected()', 'Async connect; isConnected() flips when the link is ready.'],
          ['releaseScanResults()', 'Reclaim scan RAM once connected.'],
          ['pairedCount() / paired(i) / forget(addr)', 'Enumerate and remove stored bonds.'],
          ['takePairingPasskey()', 'When a peripheral requires passkey pairing, returns the six-digit code to show the user.'],
        ]}
      />
      <P>
        Pairing defaults to <strong>Just Works</strong> (bonded, no MITM) — page turners and remotes
        usually have no input or display, and mandatory MITM makes them reject pairing. Firmware that
        specifically needs host-display keyboard pairing opts in with{' '}
        <Code>-DFREEINK_BLE_HID_REQUIRE_MITM=1</Code>, and then reads the six-digit code via{' '}
        <Code>takePairingPasskey()</Code>.
      </P>
      <CodeBlock lang="cpp">{`#include <BleKeyboardHost.h>

void setup() { BleHid.begin("FreeInk"); }

void loop() {
  BleHid.poll();
  freeink::KeyEvent ev;
  while (BleHid.popKey(ev)) {
    if (ev.special == freeink::SpecialKey::PageDown) { /* page turner */ }
    else if (ev.ch) { /* printable keyboard input */ }
  }
}`}</CodeBlock>

      <H2>How it works</H2>
      <P>
        <strong>Scan</strong> is an active scan that upserts every advertiser into a fixed array and
        records the HID service UUID; HID is validated at connect time, so devices that hide their name
        or services in scan-response / extended-advertising fragments still appear in the pairing UI.{' '}
        <strong>Connect</strong> runs on a dedicated FreeRTOS task: connect → discover HID → bond
        (<Code>secureConnection()</Code>) → switch to <strong>Report Protocol</strong> mode → subscribe
        to Input reports, falling back to Boot Keyboard Input (<Code>0x2A22</Code>) for boot-only
        devices. <strong>Reports</strong> are normalized to <Code>[mod][k0..k5]</Code>, diffed against
        the previous report, and translated (US QWERTY HID usages) into <Code>KeyEvent</Code>s — page
        turners' arrow / page-up/down usages arrive as <Code>SpecialKey</Code>. Gamepad-style remotes (a
        HID button bitfield that only clears the pressed bit on release) are decoded without phantom
        double-presses. Since HID sends one
        report per state change, <Code>poll()</Code> <strong>synthesizes auto-repeat</strong> for a held
        key after an initial delay.
      </P>

      <H2>Memory</H2>
      <P>
        All storage is fixed-capacity — discovered devices (<Code>kMaxDiscovered</Code> = 24), bonds
        (<Code>kMaxBonds</Code> = 4), and the key ring (<Code>kKeyQueueLen</Code> = 16) — with one active
        connection and no <Code>std::vector</Code> / heap in the hot path. Configure NimBLE central-only,
        single-connection to keep its static footprint small on the C3.
      </P>
    </>
  )
}
