import { Button } from './ui.jsx'
import { UsersIcon, LifebuoyIcon, CodeBracketIcon, PuzzleIcon, EnvelopeIcon } from './icons.jsx'

const REASONS = [
  {
    icon: UsersIcon,
    title: 'Collaboration',
    body: 'Building something in the open e-reader space? Let’s join forces on firmware, tooling, or research.',
  },
  {
    icon: LifebuoyIcon,
    title: 'Device support',
    body: 'Stuck on a flash, a board revision, or a feature on your reader? Reach out and we’ll help you sort it.',
  },
  {
    icon: CodeBracketIcon,
    title: 'Custom development',
    body: 'Need bespoke firmware, a port to new hardware, or a feature built to spec? Tell us what you have in mind.',
  },
  {
    icon: PuzzleIcon,
    title: 'Partnerships',
    body: 'Manufacturers, distributors, and communities welcome. Let’s talk about shipping open devices together.',
  },
]

export default function GetInTouch() {
  return (
    <section id="contact" className="border-t border-stone-200 dark:border-white/10">
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 dot-field text-flame-500/10 [mask-image:radial-gradient(60%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32 lg:px-8">
          <p className="flex items-center justify-center gap-x-2.5 font-mono text-xs font-medium tracking-wide text-flame-600 uppercase dark:text-flame-500">
            <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
            Get in touch
            <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
          </p>
          <h2 className="mx-auto mt-5 max-w-[24ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            Let’s build something together.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            Whether you want to collaborate, need a hand with your device, have a custom build in mind,
            or want to partner up — we’d love to hear from you.
          </p>

          <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-left sm:grid-cols-2">
            {REASONS.map((r) => (
              <div key={r.title} className="border-t border-stone-200 pt-6 dark:border-white/10">
                <dt className="flex items-center gap-x-3">
                  <r.icon className="size-6 shrink-0 stroke-flame-600 dark:stroke-flame-500" />
                  <span className="font-display text-base font-semibold text-stone-900 dark:text-white">
                    {r.title}
                  </span>
                </dt>
                <dd className="mt-3 text-base/7 text-stone-600 sm:text-sm/6 dark:text-stone-400">{r.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-col items-center gap-y-4">
            <Button as="a" href="mailto:hello@freeink.org" variant="primary" className="px-4 py-2.5">
              <EnvelopeIcon className="size-5" />
              Email hello@freeink.org
            </Button>
            <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
              We usually reply within a couple of days.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
