// Shared primitives so spacing, button styling and eyebrows stay consistent
// across every section (per the landing-page consistency rules).

export function Button({ as = 'a', variant = 'outline', className = '', children, ...props }) {
  const Tag = as
  const base =
    'inline-flex items-center justify-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2'
  const variants = {
    // The single filled/solid primary on the page lives in the hero.
    primary:
      'bg-flame-600 text-white shadow-sm hover:bg-flame-700 focus-visible:outline-flame-600',
    outline:
      'text-stone-700 ring-1 ring-stone-300 hover:bg-stone-100 focus-visible:outline-stone-400 dark:text-stone-200 dark:ring-white/15 dark:hover:bg-white/5 dark:focus-visible:outline-white/30',
  }
  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`flex items-center gap-x-2.5 font-mono text-xs font-medium tracking-wide text-flame-600 uppercase dark:text-flame-500 ${className}`}>
      <span aria-hidden="true" className="h-px w-6 bg-flame-500/60" />
      {children}
    </p>
  )
}

// Outer (padding + optional bg) / inner (max-width + centering) section shell.
export function Section({ id, className = '', innerClassName = '', children }) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className={`mx-auto max-w-7xl px-6 lg:px-8 ${innerClassName}`}>{children}</div>
    </section>
  )
}

// Inline "Read more →" text link, used consistently for low-key secondary actions.
export function TextLink({ href = '#', children, className = '' }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-x-1.5 text-sm font-medium text-flame-600 hover:text-flame-700 dark:text-flame-500 dark:hover:text-flame-400 ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        &rarr;
      </span>
    </a>
  )
}
