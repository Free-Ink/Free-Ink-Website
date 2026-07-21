import { HeroSchematic } from './Schematics.jsx'
import { Button, Eyebrow } from './ui.jsx'
import { GitHubIcon } from './icons.jsx'

const PARTNERS = [
  { name: 'Xteink', href: 'https://www.xteink.com', src: '/img/partners/xteink.svg', className: 'h-5' },
  { name: 'Seeed Studio', href: 'https://www.seeedstudio.com', src: '/img/partners/seeed-studio.png', className: 'h-4' },
]

function PartnerStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
      <p className="font-mono text-xs tracking-wide text-stone-400 uppercase dark:text-stone-500">
        Official partners of
      </p>
      {PARTNERS.map((partner) => (
        <a
          key={partner.name}
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer"
          title={partner.name}
        >
          <img
            src={partner.src}
            alt={partner.name}
            className={`${partner.className} w-auto brightness-0 opacity-50 transition-opacity hover:opacity-80 dark:invert`}
          />
        </a>
      ))}
    </div>
  )
}

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

          <div className="mt-12 max-w-lg border-t border-stone-200 pt-8 dark:border-white/10">
            <PartnerStrip />
          </div>
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
              fig 1.0 · the open reader
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
