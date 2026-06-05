// Single source of truth for the docs: the sidebar grouping, the route table
// and the prev/next ordering all derive from DOC_GROUPS. To add a page, write
// its component under ./pages and add one entry here.
import Overview from './pages/Overview.jsx'
import Quickstart from './pages/Quickstart.jsx'
import Installation from './pages/Installation.jsx'
import Architecture from './pages/Architecture.jsx'
import BuildComposition from './pages/BuildComposition.jsx'
import Devices from './pages/Devices.jsx'
import AddingADevice from './pages/AddingADevice.jsx'
import McuPortability from './pages/McuPortability.jsx'
import LibrariesOverview from './pages/LibrariesOverview.jsx'
import Display from './pages/libs/Display.jsx'
import InputManager from './pages/libs/InputManager.jsx'
import BatteryMonitor from './pages/libs/BatteryMonitor.jsx'
import SdCard from './pages/libs/SdCard.jsx'
import Frontlight from './pages/libs/Frontlight.jsx'
import PowerManager from './pages/libs/PowerManager.jsx'
import Networking from './pages/Networking.jsx'
import BoardConfig from './pages/libs/BoardConfig.jsx'
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
    ],
  },
  {
    title: 'Libraries',
    pages: [
      {
        slug: 'api',
        title: 'Libraries overview',
        description: 'Reference for the FreeInk libraries: APIs, defaults and build flags.',
        Content: LibrariesOverview,
      },
      {
        slug: 'lib-display',
        title: 'EInkDisplay',
        description: 'The display facade: framebuffer, geometry, refresh and grayscale.',
        Content: Display,
      },
      {
        slug: 'lib-input',
        title: 'InputManager',
        description: 'Buttons and capacitive touch behind one object.',
        Content: InputManager,
      },
      {
        slug: 'lib-battery',
        title: 'BatteryMonitor',
        description: 'ADC gauge or BQ27220 I²C fuel gauge, one API.',
        Content: BatteryMonitor,
      },
      {
        slug: 'lib-sd',
        title: 'SDCardManager',
        description: 'SdFat-over-SPI or native 4-bit SDMMC, one API.',
        Content: SdCard,
      },
      {
        slug: 'lib-frontlight',
        title: 'FrontlightManager',
        description: 'PWM frontlight with warm/cool control.',
        Content: Frontlight,
      },
      {
        slug: 'lib-power',
        title: 'PowerManager',
        description: 'Portable deep-sleep wake-on-power-button.',
        Content: PowerManager,
      },
      {
        slug: 'networking',
        title: 'SecureNet',
        description: 'Opt-in wolfSSL TLS 1.3 transport.',
        Content: Networking,
      },
      {
        slug: 'lib-board',
        title: 'BoardConfig',
        description: 'Board profiles and the runtime-active device.',
        Content: BoardConfig,
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
      {
        slug: 'mcu-portability',
        title: 'MCU portability',
        description: 'Keep a consumer building across ESP32-C3 and ESP32-S3.',
        Content: McuPortability,
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
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
