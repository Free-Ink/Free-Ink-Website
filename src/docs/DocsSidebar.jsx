import { NavLink } from 'react-router-dom'
import { DOC_GROUPS } from './registry.js'

// The persistent docs navigation. Rendered both in the desktop rail and inside
// the mobile drawer; `onNavigate` lets the drawer close itself on selection.
export default function DocsSidebar({ onNavigate }) {
  return (
    <nav className="space-y-8">
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
