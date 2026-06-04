// Styled building blocks for documentation content, matching the site's
// stone/flame palette and Space Grotesk / IBM Plex Mono type system. Pages
// compose these instead of relying on a global prose stylesheet, so each
// element stays in our control (and in our dark mode).
import { Link } from 'react-router-dom'

function slugify(children) {
  return String(Array.isArray(children) ? children.join('') : children)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function Lead({ children }) {
  return (
    <p className="mt-4 text-lg/8 text-pretty text-stone-600 dark:text-stone-300">{children}</p>
  )
}

export function P({ children }) {
  return <p className="mt-5 text-base/7 text-stone-700 dark:text-stone-300">{children}</p>
}

// A heading that doubles as a deep-link target; the id is used by the
// "On this page" rail and by anchor links.
export function H2({ children, id }) {
  const anchor = id || slugify(children)
  return (
    <h2
      id={anchor}
      className="group mt-14 scroll-mt-24 font-display text-2xl font-semibold tracking-tight text-stone-900 first:mt-0 dark:text-white"
    >
      <a href={`#${anchor}`} className="no-underline">
        {children}
        <span className="ml-2 text-flame-500 opacity-0 transition group-hover:opacity-100" aria-hidden="true">
          #
        </span>
      </a>
    </h2>
  )
}

export function H3({ children, id }) {
  const anchor = id || slugify(children)
  return (
    <h3
      id={anchor}
      className="mt-10 scroll-mt-24 font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-white"
    >
      {children}
    </h3>
  )
}

export function A({ href = '#', children, ...props }) {
  const internal = href.startsWith('/') && !href.startsWith('//')
  const className =
    'font-medium text-flame-600 underline decoration-flame-500/30 underline-offset-2 hover:decoration-flame-500 dark:text-flame-400'
  if (internal) {
    return (
      <Link to={href} className={className} {...props}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className} {...props}>
      {children}
    </a>
  )
}

export function Ul({ children }) {
  return (
    <ul className="mt-5 space-y-2.5 text-base/7 text-stone-700 dark:text-stone-300">{children}</ul>
  )
}

export function Ol({ children }) {
  return (
    <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-base/7 marker:font-mono marker:text-stone-400 text-stone-700 dark:text-stone-300">
      {children}
    </ol>
  )
}

export function Li({ children }) {
  return (
    <li className="relative pl-5 [ol_&]:pl-0">
      <span
        aria-hidden="true"
        className="absolute top-[0.7em] left-0 size-1.5 -translate-y-1/2 rounded-full bg-flame-500/70 [ol_&]:hidden"
      />
      {children}
    </li>
  )
}

export function Code({ children }) {
  return (
    <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[0.85em] text-stone-800 dark:bg-white/10 dark:text-stone-200">
      {children}
    </code>
  )
}

export function CodeBlock({ children, lang }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-stone-100/70 dark:border-white/10 dark:bg-white/[0.03]">
      {lang && (
        <div className="border-b border-stone-200 px-4 py-2 font-mono text-[0.7rem] tracking-wide text-stone-400 uppercase dark:border-white/10 dark:text-stone-500">
          {lang}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 text-[0.8125rem]/6">
        <code className="font-mono text-stone-800 dark:text-stone-200">{children}</code>
      </pre>
    </div>
  )
}

export function Table({ head, rows }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 dark:border-white/10">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-100/50 dark:border-white/10 dark:bg-white/[0.02]">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-mono text-[0.7rem] tracking-wide text-stone-400 uppercase dark:text-stone-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stone-200 last:border-0 dark:border-white/10">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 align-top text-stone-700 first:font-medium first:text-stone-900 dark:text-stone-300 dark:first:text-white"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Callout({ title, children, tone = 'note' }) {
  const tones = {
    note: 'border-flame-500/30 bg-flame-500/[0.06] text-flame-700 dark:text-flame-300',
    warn: 'border-amber-500/30 bg-amber-500/[0.07] text-amber-700 dark:text-amber-300',
  }
  return (
    <div className={`mt-6 rounded-xl border px-4 py-3.5 ${tones[tone]}`}>
      {title && <p className="font-display text-sm font-semibold">{title}</p>}
      <div className="text-sm/6 text-stone-700 dark:text-stone-300 [&>p:first-child]:mt-0">{children}</div>
    </div>
  )
}
