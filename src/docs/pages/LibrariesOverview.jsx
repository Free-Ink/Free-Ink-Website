import { Link } from 'react-router-dom'
import { Lead, P, A, Code } from '../prose.jsx'

// Each library gets its own page; this is the index that links them all.
const LIBS = [
  { slug: 'lib-display', name: 'Display · EInkDisplay', blurb: 'The facade: framebuffer, geometry, refresh modes and grayscale.' },
  { slug: 'lib-input', name: 'Input & touch · InputManager', blurb: 'Buttons plus capacitive touch (CHSC6x, GT911).' },
  { slug: 'lib-battery', name: 'Battery · BatteryMonitor', blurb: 'ADC battery gauge with optional charge-sense.' },
  { slug: 'lib-sd', name: 'SD storage · SDCardManager', blurb: 'SdFat-over-SPI or native 4-bit SDMMC, one API.' },
  { slug: 'lib-frontlight', name: 'Frontlight · FrontlightManager', blurb: 'PWM frontlight with warm/cool control.' },
  { slug: 'lib-power', name: 'Power & sleep · PowerManager', blurb: 'Portable deep-sleep wake-on-power-button.' },
  { slug: 'networking', name: 'Networking · SecureNet', blurb: 'Opt-in wolfSSL TLS 1.3 transport.' },
  { slug: 'lib-board', name: 'Board config · BoardConfig', blurb: 'Board profiles and the runtime-active device.' },
]

export default function LibrariesOverview() {
  return (
    <>
      <Lead>
        The SDK is a set of self-contained libraries, each its own PlatformIO dependency. Pick one for
        its API, defaults and build flags. Everything lives in <Code>namespace freeink</Code>; the
        legacy type names (<Code>EInkDisplay</Code> and friends) are preserved by the compatibility shim.
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
