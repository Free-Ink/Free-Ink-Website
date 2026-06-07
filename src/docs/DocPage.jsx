import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons.jsx'
import { getDocNeighbors } from './registry.js'

// Renders one documentation page: a header (title + lead), the page body, and
// prev/next links derived from the registry order.
export default function DocPage({ page }) {
  const { Content, title, description, slug } = page
  const { prev, next } = getDocNeighbors(slug)
  const { hash } = useLocation()

  // Keep the document title in sync for bookmarks / history.
  useEffect(() => {
    document.title = `${title} · FreeInk SDK Docs`
    return () => {
      document.title = 'Free Ink · An open ecosystem for e-readers'
    }
  }, [title])

  // Scroll to a heading anchor (e.g. when arriving from search); otherwise reset
  // to the top when the page changes.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [slug, hash])

  return (
    <article className="py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-stone-200 pb-8 dark:border-white/10">
          <p className="font-mono text-xs tracking-wide text-flame-600 uppercase dark:text-flame-500">
            {page.group}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg/8 text-pretty text-stone-500 dark:text-stone-400">
              {description}
            </p>
          )}
        </header>

        <div className="pt-10">
          <Content />
        </div>

        <nav className="mt-16 grid grid-cols-1 gap-4 border-t border-stone-200 pt-8 sm:grid-cols-2 dark:border-white/10">
          {prev ? (
            <Link
              to={`/docs/${prev.slug}`}
              className="group flex flex-col rounded-xl border border-stone-200 px-5 py-4 transition hover:border-flame-500/50 hover:bg-stone-100/50 dark:border-white/10 dark:hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-x-1.5 font-mono text-xs tracking-wide text-stone-400 uppercase">
                <ArrowRightIcon className="size-3 rotate-180" />
                Previous
              </span>
              <span className="mt-1 font-display text-sm font-semibold text-stone-900 dark:text-white">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/docs/${next.slug}`}
              className="group flex flex-col rounded-xl border border-stone-200 px-5 py-4 text-right transition hover:border-flame-500/50 hover:bg-stone-100/50 sm:col-start-2 dark:border-white/10 dark:hover:bg-white/[0.03]"
            >
              <span className="flex items-center justify-end gap-x-1.5 font-mono text-xs tracking-wide text-stone-400 uppercase">
                Next
                <ArrowRightIcon className="size-3" />
              </span>
              <span className="mt-1 font-display text-sm font-semibold text-stone-900 dark:text-white">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  )
}
