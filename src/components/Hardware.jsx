import { Section, Eyebrow, TextLink } from './ui.jsx'
import { PcbDiagram } from './Schematics.jsx'

const SPECS = [
  { k: 'Compute', v: 'ESP32-S3-WROOM-1 with WiFi, BLE, dual-core and on-board PSRAM' },
  { k: 'Display', v: 'Waveshare-compatible 2.3″ e-ink over a 24-pin FPC connector' },
  { k: 'Storage', v: 'microSD (SDMMC) for your whole library, fully offline' },
  { k: 'Power', v: '3.7 V LiPo with reverse-polarity protection, charged over USB-C' },
  { k: 'Charging', v: 'MCP73832 charge controller + DW01A over-charge/discharge protection' },
  { k: 'Frontlight', v: 'Warm / cool LED boost driver with PWM brightness and open-circuit sense' },
  { k: 'Controls', v: 'Resistor-ladder buttons: Left, Right, Confirm, Back, Power' },
  { k: 'Expansion', v: '10-pin GPIO header breaks out every spare pin for hacking' },
]

export default function Hardware() {
  return (
    <Section id="hardware" className="border-t border-stone-200 bg-stone-100/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>The hardware · minRead board</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            An e-reader you can actually open.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            minRead is the open hardware core of the project: a compact control board built from
            hand-solderable parts, with published schematics and a full bill of materials. Charging,
            battery protection, frontlight and e-ink driver, all on one tidy PCB.
          </p>
          <div className="mt-8">
            <TextLink href="#">Explore the hardware</TextLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-white/10 dark:bg-stone-900">
            <div className="mb-4 flex items-center justify-between font-mono text-[0.6875rem] text-stone-400 dark:text-stone-500">
              <span>minread.sch · block diagram</span>
              <span>rev. B</span>
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
