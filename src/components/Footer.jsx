import { Logo } from './Brand.jsx'
import { GitHubIcon } from './icons.jsx'

const COLUMNS = [
  {
    title: 'Software',
    links: ['CrossPoint Reader', 'Reader features', 'Fonts & themes', 'Release notes'],
  },
  {
    title: 'Hardware',
    links: ['minRead board', 'Schematics', 'Bill of materials', 'Assembly guide'],
  },
  {
    title: 'Community',
    links: ['GitHub', 'Contributing', 'Nightly builds', 'Themes'],
  },
  {
    title: 'Project',
    links: ['Manifesto', 'Documentation', 'License', 'Status'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/50 dark:border-white/10 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <a href="/" aria-label="Homepage" className="flex items-center gap-x-2.5">
              <Logo className="size-7" />
              <span className="font-display text-base font-semibold tracking-tight text-stone-900 dark:text-white">
                Free<span className="text-flame-600 dark:text-flame-500">Ink</span>
              </span>
            </a>
            <p className="mt-4 max-w-[34ch] text-sm/6 text-stone-500 dark:text-stone-400">
              An open-source collective building e-reader software, firmware and hardware that anyone
              can build on.
            </p>
            <a
              href="https://github.com"
              aria-label="Free Ink on GitHub"
              className="mt-5 inline-flex text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
            >
              <GitHubIcon className="size-5" />
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-medium tracking-wide text-stone-400 uppercase dark:text-stone-500">
                {col.title}
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-normal text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-y-4 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
            MIT &amp; open-hardware licensed. Built in the open.
          </p>
          <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
            © 2026 Free Ink Collective. Independent and community-run.
          </p>
        </div>
      </div>
    </footer>
  )
}
