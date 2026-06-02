import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from './icons.jsx'

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('free-ink-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex size-9 items-center justify-center rounded-md text-stone-600 ring-1 ring-stone-300 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 dark:text-stone-300 dark:ring-white/15 dark:hover:bg-white/5 dark:hover:text-white"
    >
      <SunIcon className="size-4 not-dark:hidden" />
      <MoonIcon className="size-4 dark:hidden" />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
      />
    </button>
  )
}
