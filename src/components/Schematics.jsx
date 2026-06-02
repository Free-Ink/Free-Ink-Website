// Decorative engineering "blueprint" graphics built from dots, traces and
// mono callouts. All colors adapt to dark mode via Tailwind utility classes.

const STROKE = 'stroke-stone-300 dark:stroke-stone-700'
const STROKE_STRONG = 'stroke-stone-400 dark:stroke-stone-600'
const LABEL = 'fill-stone-500 dark:fill-stone-400 font-mono'
const SCREEN_LINE = 'stroke-stone-300 dark:stroke-stone-700'

function Callout({ x1, y1, x2, y2, anchor, label, value }) {
  return (
    <g>
      <path d={`M${x1} ${y1} L${x2} ${y2}`} className={STROKE} strokeWidth="1" fill="none" />
      <circle cx={x1} cy={y1} r="2.5" className="fill-flame-500" />
      <text x={anchor === 'end' ? x2 - 6 : x2 + 6} y={y2 - 2} textAnchor={anchor} className={LABEL} fontSize="11" fontWeight="600">
        {label}
      </text>
      <text x={anchor === 'end' ? x2 - 6 : x2 + 6} y={y2 + 11} textAnchor={anchor} className="fill-stone-400 dark:fill-stone-500 font-mono" fontSize="9.5">
        {value}
      </text>
    </g>
  )
}

export function HeroSchematic({ className = '' }) {
  // Lines of "text" on the e-ink screen.
  const lines = []
  const widths = [120, 96, 134, 110, 128, 80, 124, 102, 118, 64]
  for (let i = 0; i < widths.length; i++) {
    lines.push(
      <line
        key={i}
        x1="244"
        y1={150 + i * 20}
        x2={244 + widths[i]}
        y2={150 + i * 20}
        className={SCREEN_LINE}
        strokeWidth="3"
        strokeLinecap="round"
      />,
    )
  }

  return (
    <svg viewBox="0 0 620 580" aria-hidden="true" className={className}>
      <defs>
        <pattern id="hero-dots" width="11" height="11" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" className="fill-stone-300 dark:fill-stone-700" />
        </pattern>
      </defs>

      {/* dimension line, left */}
      <g className={STROKE} strokeWidth="1">
        <line x1="150" y1="96" x2="150" y2="488" />
        <line x1="146" y1="96" x2="154" y2="96" />
        <line x1="146" y1="488" x2="154" y2="488" />
      </g>
      <text x="142" y="296" textAnchor="end" className={LABEL} fontSize="10">158 mm</text>

      {/* device body */}
      <rect x="226" y="96" width="234" height="392" rx="18" className={`${STROKE_STRONG} fill-stone-50 dark:fill-stone-900`} strokeWidth="1.5" />
      {/* screen well */}
      <rect x="240" y="120" width="206" height="300" rx="4" fill="url(#hero-dots)" className={STROKE} strokeWidth="1.5" />
      <rect x="240" y="120" width="206" height="300" rx="4" className={STROKE} fill="none" strokeWidth="1.5" />
      {lines}

      {/* control buttons */}
      <g className={`${STROKE_STRONG} fill-stone-100 dark:fill-stone-800`} strokeWidth="1.5">
        <circle cx="280" cy="452" r="9" />
        <circle cx="326" cy="452" r="9" />
        <circle cx="372" cy="452" r="9" />
        <circle cx="418" cy="452" r="9" />
      </g>
      <circle cx="343" cy="452" r="2" className="fill-flame-500" opacity="0" />

      {/* internal traces hinting at the PCB */}
      <g className="stroke-flame-500/40" strokeWidth="1" fill="none">
        <path d="M446 200 H472 V250" />
        <path d="M240 320 H214 V360" />
      </g>

      {/* callouts */}
      <Callout x1={446} y1={160} x2={560} y2={150} anchor="start" label="E-INK 2.3″" value="grayscale · 16-level AA" />
      <Callout x1={472} y1={250} x2={560} y2={250} anchor="start" label="ESP32-S3" value="WiFi · BLE · PSRAM" />
      <Callout x1={446} y1={350} x2={560} y2={350} anchor="start" label="USB-C" value="charge + data" />

      <Callout x1={240} y1={170} x2={120} y2={160} anchor="end" label="FRONTLIGHT" value="warm / cool PWM" />
      <Callout x1={214} y1={360} x2={120} y2={360} anchor="end" label="microSD" value="your library, offline" />
      <Callout x1={240} y1={430} x2={120} y2={440} anchor="end" label="LiPo 3.7V" value="protected charge path" />
    </svg>
  )
}

export function DotChart({ className = '' }) {
  // A small "refresh latency improving over releases" bar-ish dot chart.
  const cols = [3, 4, 6, 5, 7, 8, 9, 11, 10, 12]
  const bars = cols.map((h, c) => {
    const dots = []
    for (let r = 0; r < h; r++) {
      const filled = r >= h - 3
      dots.push(
        <circle
          key={r}
          cx={10 + c * 16}
          cy={150 - r * 12}
          r="2.5"
          className={filled ? 'fill-flame-500' : 'fill-stone-300 dark:fill-stone-700'}
        />,
      )
    }
    return <g key={c}>{dots}</g>
  })
  return (
    <svg viewBox="0 0 170 165" aria-hidden="true" className={className}>
      <line x1="2" y1="156" x2="168" y2="156" className="stroke-stone-200 dark:stroke-stone-800" strokeWidth="1" />
      {bars}
    </svg>
  )
}

// Compact PCB block diagram used in the hardware section.
export function PcbDiagram({ className = '' }) {
  const blocks = [
    { x: 30, y: 30, w: 120, h: 80, label: 'ESP32-S3', sub: 'WROOM-1' },
    { x: 30, y: 140, w: 120, h: 56, label: 'microSD', sub: 'SDMMC' },
    { x: 180, y: 30, w: 120, h: 56, label: 'E-INK DRV', sub: 'SPI / FPC' },
    { x: 180, y: 110, w: 120, h: 56, label: 'CHARGER', sub: 'MCP73832' },
    { x: 180, y: 188, w: 120, h: 40, label: 'PROTECT', sub: 'DW01A' },
    { x: 330, y: 30, w: 116, h: 56, label: 'USB-C', sub: '5V in' },
    { x: 330, y: 110, w: 116, h: 56, label: 'LED BOOST', sub: 'AP3012 · 29V' },
    { x: 330, y: 188, w: 116, h: 40, label: 'LiPo 3.7V', sub: 'JST-PH' },
  ]
  return (
    <svg viewBox="0 0 476 252" aria-hidden="true" className={className}>
      <defs>
        <pattern id="pcb-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.9" className="fill-stone-200 dark:fill-stone-800" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="472" height="248" rx="8" fill="url(#pcb-dots)" className={STROKE} strokeWidth="1" />

      {/* traces */}
      <g className="stroke-flame-500/45" strokeWidth="1.25" fill="none">
        <path d="M150 70 H180" />
        <path d="M150 168 H165 V58 H180" />
        <path d="M300 58 H315 V138 H330" />
        <path d="M300 138 H330" />
        <path d="M388 86 V110" />
        <path d="M388 166 V188" />
      </g>

      {blocks.map((b) => (
        <g key={b.label}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="4"
            className={`${STROKE_STRONG} fill-stone-50 dark:fill-stone-900`}
            strokeWidth="1.25"
          />
          <text x={b.x + 10} y={b.y + 22} className="fill-stone-700 dark:fill-stone-200 font-mono" fontSize="12" fontWeight="600">
            {b.label}
          </text>
          <text x={b.x + 10} y={b.y + 37} className="fill-stone-400 dark:fill-stone-500 font-mono" fontSize="10">
            {b.sub}
          </text>
        </g>
      ))}
    </svg>
  )
}
