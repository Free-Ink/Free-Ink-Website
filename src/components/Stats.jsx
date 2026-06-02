import { Section, Eyebrow } from './ui.jsx'
import { DotChart } from './Schematics.jsx'

const STATS = [
  { v: 'X3 / X4', k: 'Readers supported' },
  { v: '10+', k: 'Interface languages' },
  { v: 'USB-C', k: 'Standard-cable charging' },
  { v: '100%', k: 'Open schematics & BOM' },
]

export default function Stats() {
  return (
    <Section>
      <div className="grid grid-cols-1 items-center gap-x-12 gap-y-12 lg:grid-cols-2">
        <div>
          <Eyebrow>By the numbers</Eyebrow>
          <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            Open from pixels to PCB.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            Every layer is public and permissively licensed. Read and audit the community firmware,
            then build, repair and remix the board. The whole stack ships in the open.
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10">
            {STATS.map((s) => (
              <div key={s.k} className="border-t border-stone-200 pt-5 dark:border-white/10">
                <dt className="font-display text-3xl font-semibold tracking-tight text-stone-900 tabular-nums dark:text-white">
                  {s.v}
                </dt>
                <dd className="mt-1 font-mono text-xs text-stone-500 dark:text-stone-400">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8 dark:border-white/10 dark:bg-stone-900">
          <div className="flex items-center justify-between font-mono text-[0.6875rem] text-stone-400 dark:text-stone-500">
            <span>releases shipped · cumulative</span>
            <span>v0.1 → v1.2</span>
          </div>
          <DotChart className="mt-6 w-full" />
          <p className="mt-6 font-mono text-xs text-stone-500 dark:text-stone-400">
            <span className="text-flame-600 dark:text-flame-500">▰</span> software + hardware, in the open
          </p>
        </div>
      </div>
    </Section>
  )
}
