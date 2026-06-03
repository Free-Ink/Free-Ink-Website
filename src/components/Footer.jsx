import { Logo } from './Brand.jsx'
import GitHubMenu from './GitHubMenu.jsx'
import { SOFTWARE_REPO, HARDWARE_REPO, SDK_REPO } from './repos.js'

const SITE = 'https://crosspointreader.com'
const DISCORD = 'https://discord.gg/y2q7WRnM4P'
const PCB_REPO = 'https://github.com/iandchasse/de-link-pcb'

const COLUMNS = [
  {
    title: 'Software',
    links: [
      { name: 'CrossPoint Reader', href: SITE },
      { name: 'FreeInk SDK', href: SDK_REPO },
      { name: 'Font builder', href: `${SITE}/fonts` },
      { name: 'User guide', href: `${SOFTWARE_REPO}/blob/master/USER_GUIDE.md` },
    ],
  },
  {
    title: 'Hardware',
    links: [
      { name: 'de-link board', href: HARDWARE_REPO },
      { name: 'Schematics', href: `${HARDWARE_REPO}tree/main/schematic` },
      { name: 'KiCad / PCB', href: PCB_REPO },
      { name: 'Cost breakdown', href: `${HARDWARE_REPO}blob/main/markdown/COST.md` },
    ],
  },
  {
    title: 'Community',
    links: [
      { name: 'Discord', href: DISCORD },
      { name: 'Contributing', href: `${SOFTWARE_REPO}/tree/master/docs/contributing` },
      { name: 'Nightly builds', href: `${SITE}/insider` },
      { name: 'Roadmap', href: `${SITE}/roadmap` },
    ],
  },
  {
    title: 'Project',
    links: [
      { name: 'Manifesto', href: '#manifesto' },
      { name: 'Documentation', href: `${SOFTWARE_REPO}/tree/master/docs` },
      { name: 'Governance', href: `${SOFTWARE_REPO}/blob/master/GOVERNANCE.md` },
      { name: 'License', href: `${SOFTWARE_REPO}/blob/master/LICENSE` },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/50 dark:border-white/10 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <a href="/" aria-label="Homepage" className="flex items-center gap-x-2.5">
              <Logo className="size-7" />
              <span className="font-display text-base font-semibold tracking-tight text-stone-900 dark:text-white">
                Free<span className="text-flame-600 dark:text-flame-500">Ink</span>
              </span>
            </a>
            <p className="mt-4 max-w-[34ch] text-sm/6 text-stone-500 dark:text-stone-400">
              An open-source collective building e-reader software, firmware and hardware that anyone
              can build on.
            </p>
            <div className="mt-5">
              <GitHubMenu
                iconOnly
                align="left"
                className="inline-flex text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
              />
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-medium tracking-wide text-stone-400 uppercase dark:text-stone-500">
                {col.title}
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}
                      className="text-sm font-normal text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-y-4 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
            MIT &amp; open-hardware licensed. Built in the open.
          </p>
          <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
            © 2026 Free Ink Collective. Independent and community-run.
          </p>
        </div>
      </div>
    </footer>
  )
}
