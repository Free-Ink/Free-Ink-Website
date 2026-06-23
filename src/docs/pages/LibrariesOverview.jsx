import { Link } from 'react-router-dom'
import { Lead, P, A, Code } from '../prose.jsx'

// Each library gets its own page; this is the index that links them all.
const LIBS = [
  { slug: 'lib-display', name: 'EInkDisplay', blurb: 'The facade: framebuffer, geometry, refresh modes and grayscale.' },
  { slug: 'lib-input', name: 'InputManager', blurb: 'Buttons plus capacitive touch (CHSC6x, GT911).' },
  { slug: 'lib-battery', name: 'BatteryMonitor', blurb: 'ADC, BQ27220 I²C fuel gauge, or M5PM1 PMIC — one API.' },
  { slug: 'lib-sd', name: 'SDCardManager', blurb: 'SdFat-over-SPI or native 4-bit SDMMC, one API.' },
  { slug: 'lib-frontlight', name: 'FrontlightManager', blurb: 'PWM frontlight with warm/cool control.' },
  { slug: 'lib-audio', name: 'AudioManager', blurb: 'WAV playback through an I2S codec (ES8388 / ES8311).' },
  { slug: 'lib-led', name: 'LedManager', blurb: 'Addressable RGB LEDs: color, brightness, non-blocking flashes.' },
  { slug: 'lib-buzzer', name: 'Buzzer', blurb: 'LEDC PWM square-wave tones on a passive buzzer.' },
  { slug: 'lib-mic', name: 'Microphone', blurb: 'PDM microphone capture to 16-bit PCM.' },
  { slug: 'lib-rtc', name: 'Rtc', blurb: 'PCF8563 real-time clock over I²C.' },
  { slug: 'lib-env', name: 'EnvironmentSensor', blurb: 'SHT40 temperature + humidity over I²C.' },
  { slug: 'lib-imu', name: 'Imu', blurb: 'LSM6DS3TR-C 6-axis accelerometer + gyroscope.' },
  { slug: 'lib-power', name: 'PowerManager', blurb: 'Portable deep-sleep wake-on-power-button.' },
  { slug: 'networking', name: 'SecureNet', blurb: 'Opt-in wolfSSL TLS 1.3 transport.' },
  { slug: 'lib-board', name: 'BoardConfig', blurb: 'Board profiles and the runtime-active device.' },
  { slug: 'lib-detect', name: 'XteinkDetect', blurb: 'Runtime X3/X4 detection via I²C fingerprinting.' },
  { slug: 'lib-ui', name: 'FreeInkUI', blurb: 'Optional immediate-mode UI framework for e-paper.' },
  { slug: 'lib-ui-components', name: 'Component gallery', blurb: 'Prebuilt components, previewed from the real 1-bit renders.' },
  { slug: 'lib-icons', name: 'Icons', blurb: 'freeink::Icon format, vendored Lucide set, and a generator.' },
]

export default function LibrariesOverview() {
  return (
    <>
      <Lead>
        The SDK is a set of self-contained libraries, each its own PlatformIO dependency — add the ones
        your device needs (<A href="/docs/installation">PlatformIO setup</A>). Everything lives in{' '}
        <Code>namespace freeink</Code>; the legacy type names (<Code>EInkDisplay</Code> and friends) are
        preserved by the compatibility shim.
      </Lead>

      <P>
        Signatures track the SDK headers under <Code>libs/</Code>. For exact types and defaults, read
        the header for each library — see <A href="/docs/repository-layout">Repository layout</A>.
      </P>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LIBS.map((lib) => (
          <Link
            key={lib.slug}
            to={`/docs/${lib.slug}`}
            className="group rounded-xl border border-stone-200 px-5 py-4 transition hover:border-flame-500/50 hover:bg-stone-100/50 dark:border-white/10 dark:hover:bg-white/[0.03]"
          >
            <span className="font-display text-sm font-semibold text-stone-900 dark:text-white">
              {lib.name}
            </span>
            <span className="mt-1 block text-sm/6 text-stone-500 dark:text-stone-400">{lib.blurb}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
