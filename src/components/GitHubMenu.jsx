import { useState, useRef, useEffect } from 'react'
import { GitHubIcon } from './icons.jsx'
import { Button } from './ui.jsx'
import { REPOS } from './repos.js'

// A GitHub "button" that opens a small menu linking out to each repo, so a
// single trigger can route to both the hardware and software projects.
export default function GitHubMenu({
  label = 'GitHub',
  variant = 'outline',
  align = 'right',
  className = '',
  iconOnly = false,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const menuAlign =
    align === 'left' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'

  return (
    <div ref={ref} className="relative inline-flex">
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={ariaLabel || 'Free Ink on GitHub'}
          aria-haspopup="menu"
          aria-expanded={open}
          className={className}
        >
          <GitHubIcon className="size-5" />
        </button>
      ) : (
        <Button
          as="button"
          type="button"
          variant={variant}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={className}
        >
          <GitHubIcon className="size-4" />
          {label}
        </Button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-2 w-64 ${menuAlign} rounded-lg border border-stone-200 bg-white p-1.5 text-left shadow-lg ring-1 ring-black/5 dark:border-white/10 dark:bg-stone-900 dark:ring-white/10`}
        >
          {REPOS.map((repo) => (
            <a
              key={repo.href}
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-x-3 rounded-md px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-white/5"
            >
              <GitHubIcon className="mt-0.5 size-4 shrink-0 text-stone-500 dark:text-stone-400" />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-stone-900 dark:text-white">{repo.name}</span>
                <span className="font-mono text-xs text-stone-500 dark:text-stone-400">{repo.label}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
