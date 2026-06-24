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
import AudioManager from './pages/libs/AudioManager.jsx'
import LedManager from './pages/libs/LedManager.jsx'
import Buzzer from './pages/libs/Buzzer.jsx'
import Microphone from './pages/libs/Microphone.jsx'
import Rtc from './pages/libs/Rtc.jsx'
import EnvironmentSensor from './pages/libs/EnvironmentSensor.jsx'
import Imu from './pages/libs/Imu.jsx'
import PowerManager from './pages/libs/PowerManager.jsx'
import Networking from './pages/Networking.jsx'
import BleKeyboardHost from './pages/libs/BleKeyboardHost.jsx'
import BoardConfig from './pages/libs/BoardConfig.jsx'
import XteinkDetect from './pages/libs/XteinkDetect.jsx'
import FreeInkUI from './pages/libs/FreeInkUI.jsx'
import Components from './pages/libs/Components.jsx'
import Icons from './pages/libs/Icons.jsx'
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
        description: 'ADC, BQ27220 I²C fuel gauge, or M5PM1 PMIC — one API.',
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
        slug: 'lib-audio',
        title: 'AudioManager',
        description: 'WAV playback through an I2S codec (Murphy M3 ES8388, M5 PaperColor ES8311).',
        Content: AudioManager,
      },
      {
        slug: 'lib-led',
        title: 'LedManager',
        description: 'Addressable RGB LEDs: color, brightness and non-blocking flashes.',
        Content: LedManager,
      },
      {
        slug: 'lib-buzzer',
        title: 'Buzzer',
        description: 'LEDC PWM square-wave tones on a passive buzzer.',
        Content: Buzzer,
      },
      {
        slug: 'lib-mic',
        title: 'Microphone',
        description: 'PDM microphone capture to 16-bit PCM.',
        Content: Microphone,
      },
      {
        slug: 'lib-rtc',
        title: 'Rtc',
        description: 'PCF8563 real-time clock over I²C.',
        Content: Rtc,
      },
      {
        slug: 'lib-env',
        title: 'EnvironmentSensor',
        description: 'SHT40 temperature + humidity over I²C.',
        Content: EnvironmentSensor,
      },
      {
        slug: 'lib-imu',
        title: 'Imu',
        description: 'LSM6DS3TR-C 6-axis accelerometer + gyroscope.',
        Content: Imu,
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
        slug: 'lib-ble',
        title: 'BleKeyboardHost',
        description: 'BLE HID host for keyboards, page turners and remotes.',
        Content: BleKeyboardHost,
      },
      {
        slug: 'lib-board',
        title: 'BoardConfig',
        description: 'Board profiles and the runtime-active device.',
        Content: BoardConfig,
      },
      {
        slug: 'lib-detect',
        title: 'XteinkDetect',
        description: 'Runtime X3/X4 detection via I²C fingerprinting.',
        Content: XteinkDetect,
      },
      {
        slug: 'lib-ui',
        title: 'FreeInkUI',
        description: 'Optional immediate-mode UI framework for e-paper.',
        Content: FreeInkUI,
      },
      {
        slug: 'lib-ui-components',
        title: 'Component gallery',
        description: 'Prebuilt FreeInkUI components, previewed from the real 1-bit renders.',
        Content: Components,
      },
      {
        slug: 'lib-icons',
        title: 'Icons',
        description: 'freeink::Icon format, vendored Lucide set, and a generator.',
        Content: Icons,
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
