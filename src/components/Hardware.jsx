import { Section, Eyebrow, TextLink } from './ui.jsx'
import { PcbDiagram } from './Schematics.jsx'
import { HARDWARE_REPO, HARDWARE_SITE } from './repos.js'

const SPECS = [
  { k: 'Compute', v: 'ESP32-S3 (N16R8) at 240 MHz, dual-core, with WiFi, BLE, 16 MB flash, 8 MB PSRAM and native USB' },
  { k: 'Display', v: '24-pin SPI e-paper, built for Good Display 4.26″ panels: plain, touch, frontlight or both' },
  { k: 'Storage', v: 'Push-push microSD over a 4-bit SDMMC interface, power-gated, for your whole library offline' },
  { k: 'Power', v: 'Single-cell Li-ion/LiPo on JST-PH, charged over USB-C by a TP4056 with DW01A and FS8205A protection' },
  { k: 'Frontlight', v: 'Optional TPS923610 constant-current driver with warm / cool selection and dimming' },
  { k: 'Controls', v: 'Eight buttons on two resistor ladders, plus power and reset' },
  { k: 'Extras', v: 'Optional capacitive touch and a DS3231 real-time clock' },
  { k: 'Expansion', v: '12-pin ESD-protected accessory header for modules and your own hacks' },
]

export default function Hardware() {
  return (
    <Section id="hardware" className="border-t border-stone-200 bg-stone-100/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>The hardware · Silkscreen</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            An e-reader you can actually open.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            Silkscreen is the open hardware core of the project: a repairable ESP32-S3 e-reader
            mainboard and the successor to de-link. It is a 2-layer board with published KiCad files
            and every part on the back, ready for a factory to assemble. Charging, battery protection,
            optional touch and frontlight, and a 24-pin e-paper interface, all on one PCB that runs
            roughly $50 to $80 a board in small batches. The first boards are still being tested, and
            firmware support is in closed beta.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <TextLink href={HARDWARE_SITE} target="_blank" rel="noreferrer">Visit silkscreenreader.com</TextLink>
            <TextLink href={HARDWARE_REPO} target="_blank" rel="noreferrer">Explore the hardware</TextLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-white/10 dark:bg-stone-900">
            <div className="mb-4 flex items-center justify-between font-mono text-[0.6875rem] text-stone-400 dark:text-stone-500">
              <span>Silkscreen · block diagram</span>
              <span>open hardware</span>
            </div>
            <PcbDiagram className="w-full" />
          </div>
        </div>
      </div>

      <dl className="mt-16 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
        {SPECS.map((s) => (
          <div key={s.k} className="flex gap-x-4 border-t border-stone-200 pt-5 dark:border-white/10">
            <dt className="w-28 shrink-0 font-mono text-xs tracking-wide text-flame-600 uppercase dark:text-flame-500">
              {s.k}
            </dt>
            <dd className="text-base/7 text-stone-700 sm:text-sm/6 dark:text-stone-300">{s.v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
