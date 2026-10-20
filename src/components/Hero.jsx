import { HeroSchematic } from './Schematics.jsx'
import { Button, Eyebrow } from './ui.jsx'
import { GitHubIcon } from './icons.jsx'

const PARTNERS = [
  { name: 'Xteink', href: 'https://www.xteink.com', src: '/img/partners/xteink.svg', className: 'h-5' },
  { name: 'Seeed Studio', href: 'https://www.seeedstudio.com', src: '/img/partners/seeed-studio.png', className: 'h-4' },
  { name: 'M5Stack', href: 'https://m5stack.com', src: '/img/partners/m5stack.svg', className: 'h-6' },
  { name: 'BOOX', href: 'https://www.boox.com', src: '/img/partners/boox.svg', className: 'h-5' },
  { name: 'BookFusion', href: 'https://www.bookfusion.com', src: '/img/partners/bookfusion.svg', className: 'h-5' },
  { name: 'EEGORead', src: '/img/partners/eegoread.png', className: 'h-3.5' },
  { name: 'CLOUD ZAO', src: '/img/partners/cloudzao.svg', className: 'h-9' },
]

function PartnerLogos({ ariaHidden }) {
  return PARTNERS.map((partner) => {
    const img = (
      <img
        src={partner.src}
        alt={ariaHidden ? '' : partner.name}
        className={`${partner.className} w-auto max-w-none brightness-0 opacity-50 transition-opacity hover:opacity-80 dark:invert`}
      />
    )
    return (
      <li key={partner.name} className="flex shrink-0 items-center">
        {partner.href ? (
          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            title={partner.name}
            tabIndex={ariaHidden ? -1 : undefined}
          >
            {img}
          </a>
        ) : (
          img
        )}
      </li>
    )
  })
}

function PartnerStrip() {
  return (
    <div>
      <p className="font-mono text-xs tracking-wide text-stone-400 uppercase dark:text-stone-500">
        Official partners of
      </p>
      {/* logos rendered twice; the track slides -50% so the loop is seamless */}
      <div className="group mt-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused]">
          <ul role="list" className="flex items-center gap-x-10 pr-10">
            <PartnerLogos />
          </ul>
          <ul role="list" aria-hidden="true" className="flex items-center gap-x-10 pr-10">
            <PartnerLogos ariaHidden />
          </ul>
        </div>
      </div>
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
            e-paper readers, all in the open.
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
