import { Section, Eyebrow, TextLink } from './ui.jsx'
import { PcbDiagram } from './Schematics.jsx'
import { HARDWARE_REPO } from './repos.js'

const SPECS = [
  { k: 'Compute', v: 'ESP32-S3 at 240 MHz, dual-core, with WiFi, BLE, 16 MB flash and optional PSRAM' },
  { k: 'Display', v: '24-pin SPI e-paper for GoodDisplay panels (3.97″, 4.26″, 7.5″ and up)' },
  { k: 'Storage', v: 'microSD over a 4-bit SDMMC interface, for your whole library offline' },
  { k: 'Power', v: 'Bring-your-own LiPo with overcharge and overdischarge protection, charged over USB-C (OTG)' },
  { k: 'Charging', v: 'MCP73832 charge controller, with DW01A and FS8205A cell protection' },
  { k: 'Frontlight', v: 'Optional series LED frontlight with cool / warm control and PWM brightness' },
  { k: 'Controls', v: 'Dual 4-switch resistor ladders plus a reset button' },
  { k: 'Expansion', v: 'Multi-function GPIO broken out for modules and your own hacks' },
]

export default function Hardware() {
  return (
    <Section id="hardware" className="border-t border-stone-200 bg-stone-100/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>The hardware · de-link</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            An e-reader you can actually open.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            de-link is the open hardware core of the project: a compact, hand-solderable ESP32-S3
            board with published KiCad schematics and a full bill of materials. Charging, battery
            protection, an optional frontlight and a 24-pin e-paper interface, all on one PCB you can
            build for around $60.
          </p>
          <div className="mt-8">
            <TextLink href={HARDWARE_REPO} target="_blank" rel="noreferrer">Explore the hardware</TextLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-white/10 dark:bg-stone-900">
            <div className="mb-4 flex items-center justify-between font-mono text-[0.6875rem] text-stone-400 dark:text-stone-500">
              <span>de-link · block diagram</span>
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
