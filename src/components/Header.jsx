import { useState } from 'react'
import { Wordmark } from './Brand.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { GitHubIcon } from './icons.jsx'
import GitHubMenu from './GitHubMenu.jsx'
import { REPOS } from './repos.js'

const NAV = [
  { name: 'Software', href: '#software' },
  { name: 'Hardware', href: '#hardware' },
  { name: 'Manifesto', href: '#manifesto' },
  { name: 'Community', href: '#community' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md dark:border-white/10 dark:bg-stone-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Wordmark />

        <div className="hidden items-center gap-x-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
            >
              {item.name}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-x-3 lg:flex">
          <ThemeToggle />
          <GitHubMenu align="right" className="px-3 py-2" />
        </div>

        <div className="flex items-center gap-x-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="inline-flex size-9 items-center justify-center rounded-md text-stone-700 ring-1 ring-stone-300 dark:text-stone-200 dark:ring-white/15"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5" aria-hidden="true">
              {open ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-stone-200 lg:hidden dark:border-white/10">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
              >
                {item.name}
              </a>
            ))}
            <p className="mt-3 px-3 pt-3 font-mono text-xs tracking-wide text-stone-400 uppercase dark:text-stone-500">
              GitHub
            </p>
            {REPOS.map((repo) => (
              <a
                key={repo.href}
                href={repo.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-x-2 rounded-md px-3 py-2.5 text-base font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
              >
                <GitHubIcon className="size-4" />
                {repo.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
