import { Link } from 'react-router-dom'
import { Button } from './ui.jsx'
import GitHubMenu from './GitHubMenu.jsx'

const WAYS = ['Write firmware', 'Lay out PCBs', 'Translate the UI', 'Design themes']

export default function Community() {
  return (
    <section id="community" className="border-t border-stone-200 dark:border-white/10">
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 dot-field text-flame-500/10 [mask-image:radial-gradient(60%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32 lg:px-8">
          <p className="flex items-center justify-center gap-x-2.5 font-mono text-xs font-medium tracking-wide text-flame-600 uppercase dark:text-flame-500">
            <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
            Join the collective
            <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
          </p>
          <h2 className="mx-auto mt-5 max-w-[24ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
            Help build the future of e-readers.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
            Open source only works when people show up. Whether you write code, design boards, or just
            want to test a nightly build, there&apos;s a place for you here.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <GitHubMenu label="Browse the repos" variant="primary" align="center" className="px-4 py-2.5" />
            <Button as={Link} to="/docs" variant="outline" className="px-4 py-2.5">
              Read the docs
            </Button>
          </div>

          <ul role="list" className="mx-auto mt-12 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {WAYS.map((w) => (
              <li key={w} className="flex items-center gap-x-2 font-mono text-xs text-stone-500 dark:text-stone-400">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-flame-500/70" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
