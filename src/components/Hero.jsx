import { HeroSchematic } from './Schematics.jsx'
import { Button, Eyebrow } from './ui.jsx'
import { GitHubIcon } from './icons.jsx'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* faint dot-matrix field behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dot-field text-stone-300/70 [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_75%)] dark:text-stone-800"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-x-12 gap-y-12 px-6 pt-16 pb-20 lg:grid-cols-12 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="lg:col-span-6">
          <Eyebrow>The open e-reader stack</Eyebrow>

          <h1 className="mt-4 max-w-[18ch] font-display text-5xl font-semibold tracking-tight text-balance text-stone-900 sm:text-6xl dark:text-white">
            An open ecosystem for e-readers.
          </h1>

          <p className="mt-6 max-w-[54ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            Free Ink is an open-source collective building the software, firmware and hardware for
            e-paper readers. Every layer ships in the open, so anyone can pick it up, extend it, and
            make it their own.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button as="a" href="#software" variant="primary" className="px-4 py-2.5">
              Explore Software
            </Button>
            <Button as="a" href="#hardware" variant="outline" className="px-4 py-2.5">
              Explore Hardware
            </Button>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-x-6 border-t border-stone-200 pt-8 dark:border-white/10">
            {[
              { v: '100%', k: 'Open source' },
              { v: 'MIT', k: '& open hardware' },
              { v: '∞', k: 'Forks welcome' },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-2xl font-semibold tracking-tight text-stone-900 tabular-nums dark:text-white">
                  {s.v}
                </dt>
                <dd className="mt-1 font-mono text-xs text-stone-500 dark:text-stone-400">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-2xl blueprint-grid text-stone-200/60 [mask-image:radial-gradient(80%_80%_at_50%_50%,black,transparent)] dark:text-stone-800/60"
            />
            <HeroSchematic className="relative w-full" />
            <div className="absolute bottom-2 left-2 flex items-center gap-x-2 font-mono text-[0.6875rem] text-stone-400 dark:text-stone-500">
              <GitHubIcon className="size-3.5" />
              fig 1.0 · the open reader, exploded
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
