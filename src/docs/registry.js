// Single source of truth for the docs: the sidebar grouping, the route table
// and the prev/next ordering all derive from DOC_GROUPS. To add a page, write
// its component under ./pages and add one entry here.
import Overview from './pages/Overview.jsx'
import Quickstart from './pages/Quickstart.jsx'
import Installation from './pages/Installation.jsx'
import Architecture from './pages/Architecture.jsx'
import BuildComposition from './pages/BuildComposition.jsx'
import Devices from './pages/Devices.jsx'
import Networking from './pages/Networking.jsx'
import AddingADevice from './pages/AddingADevice.jsx'
import ApiReference from './pages/ApiReference.jsx'
import RepositoryLayout from './pages/RepositoryLayout.jsx'

export const DOC_GROUPS = [
  {
    title: 'Getting started',
    pages: [
      {
        slug: 'overview',
        title: 'Overview',
        description: 'What FreeInk is, why it exists, and how the pieces fit together.',
        Content: Overview,
      },
      {
        slug: 'quickstart',
        title: 'Quickstart',
        description: 'Drive an e-paper panel with FreeInk in a few minutes.',
        Content: Quickstart,
      },
      {
        slug: 'installation',
        title: 'PlatformIO setup',
        description: 'Add the FreeInk libraries to a PlatformIO project.',
        Content: Installation,
      },
    ],
  },
  {
    title: 'Concepts',
    pages: [
      {
        slug: 'architecture',
        title: 'Architecture',
        description: 'The facade, panel drivers, the bus, and board config.',
        Content: Architecture,
      },
      {
        slug: 'build-composition',
        title: 'Build composition',
        description: 'Compose a binary along two axes: devices × capabilities.',
        Content: BuildComposition,
      },
      {
        slug: 'devices',
        title: 'Supported devices',
        description: 'The device matrix, refresh behavior and touch support.',
        Content: Devices,
      },
      {
        slug: 'networking',
        title: 'Networking · TLS 1.3',
        description: 'SecureNet: a bundled wolfSSL TLS 1.3 transport.',
        Content: Networking,
      },
    ],
  },
  {
    title: 'Guides',
    pages: [
      {
        slug: 'adding-a-device',
        title: 'Adding a device',
        description: 'Bring up a new board: profile, driver config, build env.',
        Content: AddingADevice,
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
      {
        slug: 'api',
        title: 'API reference',
        description: 'The library surface: display, input, battery, storage and more.',
        Content: ApiReference,
      },
      {
        slug: 'repository-layout',
        title: 'Repository layout',
        description: 'Where each library lives in the SDK tree.',
        Content: RepositoryLayout,
      },
    ],
  },
]

// Flattened, in sidebar order — used for routes and prev/next navigation.
export const DOC_PAGES = DOC_GROUPS.flatMap((group) =>
  group.pages.map((page) => ({ ...page, group: group.title })),
)

export const FIRST_DOC_SLUG = DOC_PAGES[0].slug

export function getDocNeighbors(slug) {
  const i = DOC_PAGES.findIndex((p) => p.slug === slug)
  return {
    prev: i > 0 ? DOC_PAGES[i - 1] : null,
    next: i >= 0 && i < DOC_PAGES.length - 1 ? DOC_PAGES[i + 1] : null,
  }
}
