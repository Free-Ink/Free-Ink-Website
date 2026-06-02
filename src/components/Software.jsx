import { Section, Eyebrow, TextLink } from './ui.jsx'
import { SOFTWARE_REPO } from './repos.js'
import {
  BookOpenIcon,
  SwatchIcon,
  ArrowPathIcon,
  BookmarkIcon,
  BoltIcon,
  LanguageIcon,
} from './icons.jsx'

const FEATURES = [
  {
    icon: BookOpenIcon,
    title: 'EPUB 2 and 3 rendering',
    body: 'Parses EPUB 2 and 3, applies embedded CSS, and lays out chapters in your font, size and margins. Pages are cached to SD on first open, so every reopen is near-instant.',
  },
  {
    icon: SwatchIcon,
    title: 'Configurable typography',
    body: 'Noto Serif and Noto Sans built in, plus any font loaded from your SD card. Tune size, spacing, margins, hyphenation, alignment and anti-aliasing.',
  },
  {
    icon: ArrowPathIcon,
    title: 'WiFi transfer and sync',
    body: 'The reader runs an upload server over WiFi. Drop EPUBs in from any browser, send straight from Calibre, and keep your place across devices with KOReader sync.',
  },
  {
    icon: BookmarkIcon,
    title: 'Bookmark any passage',
    body: 'Hold Confirm anywhere to drop a bookmark. Every saved spot remembers its page and reading percentage, so you can flip back to a favourite line in a tap.',
  },
  {
    icon: BoltIcon,
    title: 'Focus Reading',
    body: 'Bolds the front of each word to guide your eye and set your pace, with grayscale anti-aliasing and tiled rendering for fast, crisp page turns.',
  },
  {
    icon: LanguageIcon,
    title: 'Speaks your language',
    body: 'Full right-to-left layout for Hebrew and Arabic, plus translated menus in Spanish, French, German, Italian, Portuguese, Russian, Ukrainian, Polish and more.',
  },
]

export default function Software() {
  return (
    <Section id="software">
      <Eyebrow>The software · CrossPoint Reader</Eyebrow>
      <h2 className="mt-4 max-w-[20ch] font-display text-4xl font-semibold tracking-tight text-balance text-stone-900 sm:text-5xl dark:text-white">
        An e-reader experience tuned to how you read.
      </h2>
      <p className="mt-6 max-w-[60ch] text-lg text-pretty text-stone-600 dark:text-stone-300">
        Community-built, fully open-source firmware for budget e-paper readers, with more features,
        more control, and an open base anyone can build on.
      </p>

      <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t border-stone-200 pt-6 dark:border-white/10">
            <dt className="flex items-center gap-x-3">
              <f.icon className="size-6 shrink-0 stroke-flame-600 dark:stroke-flame-500" />
              <span className="font-display text-base font-semibold text-stone-900 dark:text-white">
                {f.title}
              </span>
            </dt>
            <dd className="mt-3 text-base/7 text-stone-600 sm:text-sm/6 dark:text-stone-400">{f.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12">
        <TextLink href={SOFTWARE_REPO} target="_blank" rel="noreferrer">Explore the software</TextLink>
      </div>
    </Section>
  )
}
