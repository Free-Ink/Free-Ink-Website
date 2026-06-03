import { Section, Eyebrow, TextLink } from './ui.jsx'
import { SDK_REPO } from './repos.js'
import {
  CpuChipIcon,
  CodeBracketIcon,
  CubeIcon,
  PuzzleIcon,
  ShieldIcon,
  LightBulbIcon,
} from './icons.jsx'

const FEATURES = [
  {
    icon: CpuChipIcon,
    title: 'Hardware-independent by design',
    body: 'Every device-specific detail lives behind small injectable interfaces: the display controller, waveforms and LUTs, GPIOs, bus speeds, touch, frontlight and audio. The firmware calls one generic API and gets device-specific behavior.',
  },
  {
    icon: CodeBracketIcon,
    title: 'Clean, stable API',
    body: 'A small, consistent surface across EInkDisplay, InputManager, BatteryMonitor, SDCardManager and BoardConfig. Firmware targets one library path and stays decoupled from the hardware underneath it.',
  },
  {
    icon: CubeIcon,
    title: 'New devices are data, not code',
    body: 'Adding a board means adding a profile and a driver config, supplying pins, geometry, waveforms and voltages as values rather than editing the generic driver. Per-device tuning stays out of the shared code path.',
  },
  {
    icon: PuzzleIcon,
    title: 'Composable builds',
    body: 'A build is composed along two axes: devices and capabilities. Touch, frontlight, color and audio are gated by flags and default on only when a device needs them, so each binary stays as tight as possible.',
  },
  {
    icon: LightBulbIcon,
    title: 'Touch and frontlight built in',
    body: 'Capacitive touch for CHSC6x and GT911 controllers, plus PWM frontlight with warm / cool control. The InputManager exposes raw touch points and the app owns rotation.',
  },
  {
    icon: ShieldIcon,
    title: 'TLS 1.3 networking',
    body: 'SecureNet bundles wolfSSL compiled from source for TLS 1.3 + PSA, bypassing the stubbed system mbedTLS so the reader can reach TLS-1.3-only servers like KOReader sync.',
  },
]

// Supported devices, pulled from the SDK README's device matrix.
const DEVICES = [
  { name: 'Xteink X4', mcu: 'ESP32-C3', controller: 'SSD1677', panel: '800×480 B/W + 4-level gray', status: 'full' },
  { name: 'Xteink X3', mcu: 'ESP32-C3', controller: 'UC8253', panel: '792×528 B/W + 4-level gray', status: 'full' },
  { name: 'de-link', mcu: 'ESP32-S3', controller: 'SSD1677', panel: '800×480 B/W + gray, frontlight', status: 'full' },
  { name: 'M5Stack PaperColor', mcu: 'ESP32-S3', controller: 'ED2208', panel: '400×600 color', status: 'wip' },
  { name: 'Murphy M3', mcu: 'ESP32-S3', controller: 'UC8253', panel: '240×416 B/W, touch + frontlight', status: 'wip' },
]

function StatusBadge({ status }) {
  const full = status === 'full'
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide whitespace-nowrap ${
        full
          ? 'bg-flame-500/10 text-flame-700 dark:text-flame-400'
          : 'bg-stone-500/10 text-stone-500 dark:text-stone-400'
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${full ? 'bg-flame-500' : 'bg-stone-400'}`} />
      {full ? 'Full' : 'Partial'}
    </span>
  )
}

export default function SDK() {
  return (
    <Section id="sdk" className="border-t border-stone-200 dark:border-white/10">
      <Eyebrow>The SDK · FreeInk</Eyebrow>
      <h2 className="mt-4 max-w-[20ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
        One firmware API. Any e-paper device.
      </h2>
      <p className="mt-6 max-w-[62ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
        FreeInk is a hardware-independent SDK for building e-paper reader firmware. It abstracts the
        controller, waveforms, pins and peripherals behind a stable facade, so one generic codebase
        drives many devices, and a new board is a profile and a config, not a rewrite.
      </p>

      <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t border-stone-200 pt-6 dark:border-white/10">
            <dt className="flex items-center gap-x-3">
              <f.icon className="size-6 shrink-0 stroke-flame-600 dark:stroke-flame-500" />
              <span className="font-display text-base font-semibold text-stone-900 dark:text-white">
                {f.title}
              </span>
            </dt>
            <dd className="mt-3 text-base/7 text-stone-600 sm:text-sm/6 dark:text-stone-400">{f.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16">
        <h3 className="font-mono text-xs tracking-wide text-flame-600 uppercase dark:text-flame-500">
          Supported devices
        </h3>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 dark:border-white/10">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/50 dark:border-white/10 dark:bg-white/[0.02]">
                {['Device', 'MCU', 'Controller', 'Panel', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 font-mono text-xs tracking-wide text-stone-400 uppercase dark:text-stone-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEVICES.map((d) => (
                <tr
                  key={d.name}
                  className="border-b border-stone-200 last:border-0 dark:border-white/10"
                >
                  <td className="px-5 py-4 font-display text-sm font-semibold text-stone-900 dark:text-white">
                    {d.name}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-stone-600 dark:text-stone-400">{d.mcu}</td>
                  <td className="px-5 py-4 font-mono text-xs text-stone-600 dark:text-stone-400">{d.controller}</td>
                  <td className="px-5 py-4 text-sm text-stone-700 dark:text-stone-300">{d.panel}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-[62ch] text-sm/6 text-stone-500 dark:text-stone-400">
          Related devices can share a single firmware build, detected and configured at runtime,
          while new controllers slot in as a standalone driver behind the facade.
        </p>
      </div>

      <div className="mt-12">
        <TextLink href={SDK_REPO} target="_blank" rel="noreferrer">Explore the SDK</TextLink>
      </div>
    </Section>
  )
}
