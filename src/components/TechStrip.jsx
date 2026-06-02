const ITEMS = [
  'ESP32-S3',
  'EPUB 2 & 3',
  'GoodDisplay e-paper',
  'WiFi book transfer',
  'KOReader Sync',
  'Calibre plugin',
  'OPDS catalogs',
  'USB-C charging',
  'microSD storage',
  'Warm / cool frontlight',
  'Focus Reading',
  'Right-to-left layout',
  'Custom fonts',
  'OTA updates',
  'KiCad source',
  '3D-printed case',
  'Swappable battery',
  'Hand-solderable',
  'No DRM',
  'Open hardware',
]

function Track({ ariaHidden }) {
  return (
    <ul
      role="list"
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-x-10 px-5 animate-ticker"
    >
      {ITEMS.map((item, i) => (
        <li key={i} className="flex items-center gap-x-10">
          <span className="font-mono text-sm whitespace-nowrap text-stone-500 dark:text-stone-400">
            {item}
          </span>
          <span aria-hidden="true" className="size-1 rounded-full bg-flame-500/70" />
        </li>
      ))}
    </ul>
  )
}

export default function TechStrip() {
  return (
    <div className="border-y border-stone-200 bg-stone-100/50 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex items-center gap-x-6">
          <p className="hidden shrink-0 font-mono text-xs tracking-wide text-stone-400 uppercase sm:block dark:text-stone-500">
            Open standards · open parts
          </p>
          <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <Track ariaHidden={false} />
            <Track ariaHidden={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
