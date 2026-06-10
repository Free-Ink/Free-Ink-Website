import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Logo } from '../components/Brand.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import GitHubMenu from '../components/GitHubMenu.jsx'
import { ArrowRightIcon, SearchIcon } from '../components/icons.jsx'
import { SPONSOR_URL } from '../components/sponsor.js'
import DocsSidebar from './DocsSidebar.jsx'

// Loaded on first open so the search UI stays out of the initial docs bundle.
const SearchDialog = lazy(() => import('./SearchDialog.jsx'))

export default function DocsLayout() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // ⌘K / Ctrl-K opens search from anywhere in the docs.
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const openSearch = () => {
    setOpen(false)
    setSearchOpen(true)
  }

  return (
    <div className="min-h-dvh">
      {/* Docs top bar — its own header (the landing nav is section-anchor based). */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md dark:border-white/10 dark:bg-stone-950/80">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-x-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle documentation menu"
              aria-expanded={open}
              className="inline-flex size-9 items-center justify-center rounded-md text-stone-700 ring-1 ring-stone-300 lg:hidden dark:text-stone-200 dark:ring-white/15"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5" aria-hidden="true">
                {open ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
            <Link to="/" aria-label="Free Ink home" className="flex items-center gap-x-1.5">
              <Logo className="size-6" />
              <span className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
                Free<span className="text-flame-600 dark:text-flame-500">Ink</span>
              </span>
            </Link>
            <span aria-hidden="true" className="hidden h-4 w-px bg-stone-300 sm:block dark:bg-white/15" />
            <span className="hidden font-mono text-xs tracking-wide text-stone-400 uppercase sm:block dark:text-stone-500">
              SDK Docs
            </span>
          </div>

          <div className="flex items-center gap-x-2 sm:gap-x-3">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-x-2 rounded-md py-1.5 pr-2 pl-2.5 text-sm text-stone-500 ring-1 ring-stone-300 transition hover:text-stone-900 sm:w-56 dark:text-stone-400 dark:ring-white/15 dark:hover:text-white"
              aria-label="Search documentation"
            >
              <SearchIcon className="size-4 shrink-0" />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="ml-auto hidden rounded border border-stone-300 px-1.5 py-0.5 font-mono text-[0.65rem] text-stone-400 sm:block dark:border-white/15">
                ⌘K
              </kbd>
            </button>
            <Link
              to="/"
              className="hidden items-center gap-x-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline-flex dark:text-stone-300 dark:hover:text-white"
            >
              <ArrowRightIcon className="size-3.5 rotate-180" />
              Back to site
            </Link>
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center justify-center rounded-md bg-flame-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-flame-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame-600 md:inline-flex"
            >
              Sponsor us
            </a>
            <ThemeToggle />
            <GitHubMenu align="right" className="px-3 py-2" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-[3.75rem] hidden h-[calc(100dvh-3.75rem)] w-64 shrink-0 overflow-y-auto py-10 pr-6 lg:block">
          <DocsSidebar onOpenSearch={openSearch} />
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute top-[3.75rem] bottom-0 left-0 w-72 overflow-y-auto border-r border-stone-200 bg-stone-50 p-6 dark:border-white/10 dark:bg-stone-950">
              <a
                href={SPONSOR_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mb-6 flex items-center justify-center rounded-md bg-flame-600 px-3 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-flame-700"
              >
                Sponsor us
              </a>
              <DocsSidebar onNavigate={() => setOpen(false)} onOpenSearch={openSearch} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 lg:border-l lg:border-stone-200 lg:pl-10 dark:lg:border-white/10">
          <Outlet />
        </main>
      </div>

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchDialog onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
