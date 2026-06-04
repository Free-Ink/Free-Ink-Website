// Free Ink mark: an e-ink tile rendered as a dot grid, with the top-right
// corner "breaking free" — dots lifting off and igniting flame red.
import { Link } from 'react-router-dom'

export function Logo({ className = 'size-8' }) {
  const dots = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      // The escaping corner: top-right dots fade out / turn red.
      const escaping = r <= 1 && c >= 3
      const cx = 6 + c * 7
      const cy = 6 + r * 7
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={cx}
          cy={cy}
          r={1.5}
          className={escaping ? 'fill-flame-500' : 'fill-stone-900 dark:fill-stone-100'}
          opacity={escaping ? (r === 0 && c === 4 ? 0.35 : 0.7) : 1}
        />,
      )
    }
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      {dots}
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <Link to="/" aria-label="Homepage" className={`flex items-center gap-x-1.5 ${className}`}>
      <Logo className="size-6" />
      <span className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
        Free<span className="text-flame-600 dark:text-flame-500">Ink</span>
      </span>
    </Link>
  )
}
