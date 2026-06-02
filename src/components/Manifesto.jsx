import {
  LockOpenIcon,
  CodeBracketIcon,
  CubeIcon,
  UsersIcon,
  ShieldIcon,
  LightBulbIcon,
} from './icons.jsx'

const PRINCIPLES = [
  {
    icon: LockOpenIcon,
    title: 'Open formats, open files',
    body: 'Books are plain files on an SD card, in open standards you can read, copy and keep on any device, forever.',
  },
  {
    icon: CodeBracketIcon,
    title: 'Open all the way down',
    body: 'Software, firmware and hardware are public and permissively licensed. Fork it, audit it, build on it.',
  },
  {
    icon: CubeIcon,
    title: 'Repairable by design',
    body: 'Hand-solderable parts, a published BOM and a swappable battery. Fix it instead of landfilling it.',
  },
  {
    icon: ShieldIcon,
    title: 'Truly yours',
    body: 'Own it outright, with no subscriptions and no accounts. The device and its software stay yours.',
  },
  {
    icon: UsersIcon,
    title: 'Built by the community',
    body: 'Developed in the open by readers and tinkerers, with nightly builds, shared themes and contributions welcome.',
  },
  {
    icon: LightBulbIcon,
    title: 'Endlessly hackable',
    body: 'Spare GPIO, custom fonts, themeable menus. Make it weird, make it fast, make it yours.',
  },
]

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative overflow-hidden border-y border-transparent bg-stone-900 py-20 sm:py-28 dark:border-white/10 dark:bg-stone-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dot-field text-white/[0.06] [mask-image:radial-gradient(100%_100%_at_50%_0%,black,transparent_80%)]"
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <p className="flex items-center gap-x-2.5 font-mono text-xs font-medium tracking-wide text-flame-500 uppercase">
          <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
          The manifesto
        </p>
        <h2 className="mt-4 max-w-[18ch] font-display text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          A foundation anyone can build on.
        </h2>
        <p className="mt-6 max-w-[58ch] text-lg text-pretty text-stone-300">
          From the rendering engine to the charging circuit, every layer is documented and open. It
          all adds up to a shared foundation the whole community can build on, fix and extend.
        </p>

        <dl className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="border-t border-white/10 pt-6">
              <dt className="flex items-center gap-x-3">
                <p.icon className="size-6 shrink-0 stroke-flame-500" />
                <span className="font-display text-base font-semibold text-white">{p.title}</span>
              </dt>
              <dd className="mt-3 text-base/7 text-stone-400 sm:text-sm/6">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
