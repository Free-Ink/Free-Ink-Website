import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon } from '../components/icons.jsx'

// Highlight every query term inside a piece of text.
function Highlight({ text, terms }) {
  if (!terms.length || !text) return text
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'ig'))
  return parts.map((part, i) =>
    escaped.some((t) => new RegExp(`^${t}$`, 'i').test(part)) ? (
      <mark key={i} className="rounded bg-flame-500/20 px-0.5 text-flame-700 dark:text-flame-300">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export default function SearchDialog({ onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [active, setActive] = useState(0)

  const terms = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounced semantic search against the Worker. An AbortController drops
  // responses from stale keystrokes so results never arrive out of order.
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setResults(data.results || [])
        setActive(0)
        setStatus('done')
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('error')
      }
    }, 180)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query])

  // Keep the active row scrolled into view.
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function go(result) {
    if (!result) return
    navigate(`/docs/${result.slug}${result.anchor ? `#${result.anchor}` : ''}`)
    onClose()
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const showEmpty = status === 'done' && results.length === 0

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search documentation">
      <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-4 top-[12vh] mx-auto max-w-xl sm:inset-x-0">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-stone-900 dark:ring-white/10">
          <div className="flex items-center gap-x-3 border-b border-stone-200 px-4 dark:border-white/10">
            <SearchIcon className="size-4 shrink-0 text-stone-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search the docs…"
              aria-label="Search the docs"
              className="w-full bg-transparent py-4 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-white"
            />
            {status === 'loading' && (
              <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-stone-300 border-t-flame-500" aria-hidden="true" />
            )}
            <kbd className="hidden shrink-0 rounded border border-stone-300 px-1.5 py-0.5 font-mono text-[0.65rem] text-stone-400 sm:block dark:border-white/15">
              Esc
            </kbd>
          </div>

          {query.trim() && (
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {status === 'error' ? (
                <p className="px-3 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                  Search is unavailable right now. Try again in a moment.
                </p>
              ) : showEmpty ? (
                <p className="px-3 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                  No results for “{query.trim()}”.
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((r, i) => (
                    <li key={`${r.slug}-${r.anchor || ''}-${i}`}>
                      <button
                        type="button"
                        data-idx={i}
                        onClick={() => go(r)}
                        onMouseMove={() => setActive(i)}
                        className={`block w-full rounded-lg px-3 py-2.5 text-left transition ${
                          i === active ? 'bg-flame-500/10' : 'hover:bg-stone-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-x-3">
                          <span className="truncate font-display text-sm font-semibold text-stone-900 dark:text-white">
                            {r.title}
                            {r.heading && r.heading !== r.title && (
                              <span className="text-stone-400 dark:text-stone-500"> › {r.heading}</span>
                            )}
                          </span>
                          <span className="shrink-0 font-mono text-[0.65rem] tracking-wide text-stone-400 uppercase dark:text-stone-500">
                            {r.group}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs/5 text-stone-500 dark:text-stone-400">
                          <Highlight text={r.snippet} terms={terms} />
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
