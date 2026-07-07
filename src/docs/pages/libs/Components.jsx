import { Fragment } from 'react'
import { Lead, P, H2, A, Code } from '../../prose.jsx'

const BASE = '/img/freeinkui'

// The four composite screens generated from the real components.
const SCREENS = [
  { file: 'freeinkui-settings.svg', title: 'Settings and controls' },
  { file: 'freeinkui-reader.svg', title: 'Reader screen controls' },
  { file: 'freeinkui-library.svg', title: 'Library and book surfaces' },
  { file: 'freeinkui-overlays.svg', title: 'Overlays, dialogs and keyboard' },
]

// Per-component palette, grouped the way the SDK groups them. file names live
// under /img/freeinkui/components/.
const GROUPS = [
  {
    title: 'Controls and settings',
    items: [
      ['button', 'button.svg', 'Themed, state-styled action — selectable by touch, focus, button or gesture via inputMask.'],
      ['checkbox', 'checkbox.svg', 'A label with a checkable box; fires a semantic action on toggle.'],
      ['slider', 'slider.svg', 'A continuous value track — dithered rail, filled portion and knob; prev/next or touch adjusts it (use stepperRow for discrete steps).'],
      ['settingRow', 'setting-row.svg', 'A label + value row for settings screens.'],
      ['toggleRow', 'toggle-row.svg', 'A settings row with an on/off switch.'],
      ['stepperRow', 'stepper-row.svg', 'A settings row with −/+ steppers, drawn as centered strokes.'],
      ['dropdown', 'dropdown.svg', 'A label + current value + chevron that opens an app-owned selection.'],
      ['radioGroup', 'radio-group.svg', 'A single-choice list of options.'],
      ['list', 'list.svg', 'Virtualized rows with fill / outline / pill styles and selection markers.'],
      ['table', 'table.svg', 'A rows × columns cell grid with grid lines, an optional header row and per-cell styles.'],
    ],
  },
  {
    title: 'Input and navigation',
    items: [
      ['textField', 'text-field.svg', 'Single-line input with a chunk-measured cursor for long strings.'],
      ['textArea', 'text-area.svg', 'A multi-line scrollable writing canvas (the editor body); the app owns the text buffer and caret.'],
      ['keyGrid', 'key-grid.svg', 'A configurable key grid with KeyKind special keys and glyph art.'],
      ['keyboard', 'qwerty-keyboard.svg', 'A data-driven on-screen keyboard with built-in QWERTY, AZERTY, QWERTZ and Spanish layouts; qwertyKeyboard is the QWERTY convenience wrapper.'],
      ['tabBar', 'tab-bar.svg', 'Pill or underline-style tabs with an optional divider.'],
      ['gestureBar', 'gesture-bar.svg', 'A button-hint bar for the available actions / gestures.'],
    ],
  },
  {
    title: 'Reader and status',
    items: [
      ['statusBar', 'status-bar.svg', 'Measured leading/trailing clusters + centered title; doubles as a page overlay.'],
      ['progressBar', 'progress-bar.svg', 'A horizontal bar; minFill keeps tiny values visible.'],
      ['readerChrome', 'reader-chrome.svg', 'Top/bottom reading chrome — title, progress label and bar.'],
      ['tapZones', 'tap-zones.svg', 'Page tap regions (prev / menu / next) plus swipe routing.'],
      ['batteryIndicator', 'battery-indicator.svg', 'Battery glyph with a triangle-built bolt while charging.'],
    ],
  },
  {
    title: 'Library surfaces',
    items: [
      ['bookCard', 'book-card.svg', 'A cover + title / author / meta + progress row for library lists.'],
      ['coverGrid', 'cover-grid.svg', 'A grid of cover art for visual selection.'],
      ['coverCarousel', 'cover-carousel.svg', 'A prev/center/next cover row with selection chrome and tap/swipe routing.'],
      ['metricCard', 'metric-card.svg', 'A statistics value / label cell.'],
    ],
  },
  {
    title: 'Overlays and dialogs',
    items: [
      ['contextMenu', 'context-menu.svg', 'A long-press / menu-button command list.'],
      ['optionDialog', 'option-dialog.svg', 'A panel with title / headline / message and an option-button row.'],
      ['popup', 'popup.svg', 'A bare dialog panel with an optional dithered scrim.'],
      ['messagePanel', 'message-panel.svg', 'An empty / error / loading panel with optional progress and retry.'],
      ['toast', 'toast.svg', 'A static, e-paper-safe notice such as “Saved” or “Sync failed”.'],
    ],
  },
  {
    title: 'Layout',
    items: [
      ['header', 'header.svg', 'A section header (or nav header — a leading back button + centered title) with an optional bottom rule.'],
      ['footer', 'footer.svg', 'A bottom action-button row, top-anchored by default; each entry is a FooterAction.'],
      ['spacer', 'spacer.svg', 'A fixed gap that reserves space between components in a Stack or Screen band.'],
    ],
  },
]

// A 1-bit render sits in a padded white "screen" card so it reads the same in
// light and dark site themes. The renders are 1px-grid pixel art, so each is
// capped at its native width and centered — no upscaling blur, no heavy
// fractional downscale that would drop hairline strokes, no overflow clip.
function Screen({ src, alt, maxW = 'max-w-[360px]' }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-stone-200 bg-white p-3 dark:border-white/10">
      <img src={src} alt={alt} className={`block h-auto w-full ${maxW}`} />
    </div>
  )
}

export default function Components() {
  return (
    <>
      <Lead>
        FreeInkUI's prebuilt components and screen surfaces. Every preview here is{' '}
        <strong>generated from the real C++ components</strong> through the native 1-bit framebuffer
        renderer (<A href="/docs/lib-ui">DisplayTarget</A>) — not drawn by hand — so what you see is what
        the panel draws. See <A href="/docs/lib-ui">FreeInkUI</A> for the layout, theming and input model
        behind them.
      </Lead>

      <H2>Screens</H2>
      <P>
        Composite screens assembled from the components below — the kinds of surfaces a reader firmware
        builds with the <Code>FreeInkApp</Code> screen builder.
      </P>
      <div className="mt-6 grid grid-cols-1 gap-6">
        {SCREENS.map((s) => (
          <figure key={s.file} className="m-0">
            <Screen src={`${BASE}/${s.file}`} alt={`${s.title} — FreeInkUI screen`} maxW="max-w-[640px]" />
            <figcaption className="mt-2 text-sm text-stone-500 dark:text-stone-400">{s.title}</figcaption>
          </figure>
        ))}
      </div>

      {GROUPS.map((group) => (
        <Fragment key={group.title}>
          <H2>{group.title}</H2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            {group.items.map(([name, file, blurb]) => (
              <div key={name}>
                <Screen src={`${BASE}/components/${file}`} alt={`${name} component preview`} />
                <p className="mt-2.5">
                  <Code>{name}</Code>
                </p>
                <p className="mt-1.5 text-sm/6 text-stone-600 dark:text-stone-400">{blurb}</p>
              </div>
            ))}
          </div>
        </Fragment>
      ))}

    </>
  )
}
