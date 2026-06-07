import { NavLink } from 'react-router-dom'
import { SearchIcon } from '../components/icons.jsx'
import { DOC_GROUPS } from './registry.js'

// The persistent docs navigation. Rendered both in the desktop rail and inside
// the mobile drawer; `onNavigate` lets the drawer close itself on selection and
// `onOpenSearch` opens the ⌘K search dialog.
export default function DocsSidebar({ onNavigate, onOpenSearch }) {
  return (
    <nav className="space-y-8">
      {onOpenSearch && (
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-x-2 rounded-md py-1.5 pr-2 pl-2.5 text-sm text-stone-500 ring-1 ring-stone-300 transition hover:text-stone-900 lg:hidden dark:text-stone-400 dark:ring-white/15 dark:hover:text-white"
        >
          <SearchIcon className="size-4 shrink-0" />
          Search…
        </button>
      )}
      {DOC_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="font-mono text-xs font-medium tracking-wide text-stone-400 uppercase dark:text-stone-500">
            {group.title}
          </p>
          <ul className="mt-3 space-y-0.5">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <NavLink
                  to={`/docs/${page.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-1.5 text-sm transition ${
                      isActive
                        ? 'bg-flame-500/10 font-medium text-flame-700 dark:text-flame-400'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white'
                    }`
                  }
                >
                  {page.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
