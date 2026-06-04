import { Lead, P, H2, H3, A, Code, CodeBlock, Table, Callout } from '../prose.jsx'

// Two-column signature/description table helper.
function Api({ rows }) {
  return (
    <Table
      head={['Member', 'Description']}
      rows={rows.map(([sig, desc]) => [<Code key="s">{sig}</Code>, desc])}
    />
  )
}

export default function ApiReference() {
  return (
    <>
      <Lead>
        The library surface, grouped by manager. Everything lives in{' '}
        <Code>namespace freeink</Code>; the legacy type names (<Code>EInkDisplay</Code> and friends) are
        preserved by the compatibility shim. Signatures below track the SDK headers.
      </Lead>

      <Callout title="Source of truth">
        <p>
          These tables summarize the public headers under <Code>libs/</Code>. For exact types and
          defaults, read the header for each library — see <A href="/docs/repository-layout">Repository layout</A>.
        </p>
      </Callout>

      <H2>EInkDisplay</H2>
      <P>
        The display facade (<Code>freeink::FreeInkDisplay</Code>, aliased to <Code>EInkDisplay</Code>).
        It owns the framebuffer and geometry and delegates to a panel driver selected at{' '}
        <Code>begin()</Code>. Construct it from the active board's display pins:
      </P>
      <CodeBlock lang="cpp">{`FreeInkDisplay(int8_t sclk, int8_t mosi, int8_t cs,
               int8_t dc, int8_t rst, int8_t busy);`}</CodeBlock>

      <H3>Lifecycle &amp; panel selection</H3>
      <Api
        rows={[
          ['begin()', 'Initialize the bus and select the panel driver for the active profile.'],
          ['setDisplayX3()', 'Switch to the X3 profile + UC8253 driver (before begin(), on a C3 X3/X4 binary).'],
          ['setDisplayM5PaperColor()', 'Switch to the M5 PaperColor profile + ED2208 driver.'],
          ['requestCompleteWaveformNextRefresh()', 'M5 only: run the next refresh’s OTP waveform to completion (one-shot).'],
          ['deepSleep()', 'Power the panel down.'],
        ]}
      />

      <H3>Geometry</H3>
      <Api
        rows={[
          ['getDisplayWidth() / getDisplayHeight()', 'Active panel dimensions in pixels.'],
          ['getDisplayWidthBytes()', 'Row stride in bytes.'],
          ['getBufferSize()', 'Framebuffer size in bytes.'],
          ['DISPLAY_WIDTH, DISPLAY_HEIGHT, BUFFER_SIZE, …', 'Compile-time constants (plus X3_* variants).'],
        ]}
      />

      <H3>Drawing into the framebuffer</H3>
      <Api
        rows={[
          ['clearScreen(uint8_t color = 0xFF)', 'Fill the buffer (0xFF = white).'],
          ['drawImage(data, x, y, w, h, fromProgmem = false)', 'Blit a 1-bpp bitmap.'],
          ['drawImageTransparent(data, x, y, w, h, fromProgmem = false)', 'Blit, skipping background pixels (icons).'],
          ['setFramebuffer(const uint8_t* bwBuffer)', 'Replace the B/W buffer wholesale.'],
          ['getFrameBuffer()', 'Pointer to the active framebuffer.'],
          ['swapBuffers()', 'Swap the double-buffered framebuffers.'],
        ]}
      />

      <H3>Refresh</H3>
      <P>
        Refresh modes: <Code>FULL_REFRESH</Code> / <Code>HALF_REFRESH</Code> / <Code>FAST_REFRESH</Code>.
      </P>
      <Api
        rows={[
          ['displayBuffer(mode = FAST_REFRESH, turnOffScreen = false)', 'Push the framebuffer to the panel.'],
          ['displayWindow(x, y, w, h, turnOffScreen = false)', 'Partial update of a region.'],
          ['refreshDisplay(mode = FAST_REFRESH, turnOffScreen = false)', 'Refresh without rewriting the buffer.'],
          ['requestResync(uint8_t settlePasses = 0)', 'X3: one-shot full resync on next update.'],
          ['skipInitialResync()', 'Skip the first-update resync.'],
        ]}
      />

      <H3>Grayscale / anti-aliased</H3>
      <Api
        rows={[
          ['copyGrayscaleBuffers(lsb, msb)', 'Load both gray planes.'],
          ['copyGrayscaleLsbBuffers(lsb) / copyGrayscaleMsbBuffers(msb)', 'Load one plane.'],
          ['writeGrayscalePlaneStrip(plane, rows, yStart, numRows)', 'Stream a row band to controller RAM (plane = GRAY_PLANE_LSB/MSB).'],
          ['supportsStripGrayscale()', 'Whether the active driver supports strip streaming.'],
          ['displayGrayBuffer(turnOffScreen = false, lut = nullptr, factoryMode = false)', 'Push the gray planes.'],
          ['cleanupGrayscaleBuffers(bwBuffer) / grayscaleRevert()', 'Clean up after an anti-aliased refresh.'],
          ['setCustomLUT(bool enabled, lutData = nullptr)', 'Install / restore a custom LUT (VCOM-safe).'],
        ]}
      />

      <H2>InputManager</H2>
      <P>
        Buttons plus optional capacitive touch behind one object. Call <Code>update()</Code> each loop,
        then query edge/level state.
      </P>
      <Api
        rows={[
          ['begin() / update()', 'Initialize; sample inputs once per loop.'],
          ['isPressed(buttonIndex)', 'Level: button currently held.'],
          ['wasPressed(buttonIndex) / wasReleased(buttonIndex)', 'Edge: press / release since last update.'],
          ['wasAnyPressed() / wasAnyReleased()', 'Any-button edge.'],
          ['getState() / getButtonName(i)', 'Raw button bitmask; human name for a button.'],
          ['BTN_BACK, BTN_CONFIRM, BTN_LEFT, BTN_RIGHT, BTN_UP, BTN_DOWN, BTN_POWER', 'Button index constants.'],
        ]}
      />
      <H3>Touch</H3>
      <P>
        Gated by <Code>FREEINK_CAP_TOUCH</Code>; inert on boards without a touch controller. Coordinates
        are raw-panel-oriented — the app owns rotation.
      </P>
      <Api
        rows={[
          ['hasTouch()', 'Whether the active board has a touch controller.'],
          ['getTouchPoint() → TouchPoint{ valid, x, y }', 'Current touch point.'],
          ['isTouchPressed()', 'Level: touched now.'],
          ['wasTouchPressed() / wasTouchReleased()', 'Edge: touch down / up.'],
        ]}
      />

      <H2>BatteryMonitor</H2>
      <CodeBlock lang="cpp">{`BatteryMonitor(uint8_t adcPin, float dividerMultiplier = 2.0f,
               int8_t chargeStatusPin = PIN_NONE);`}</CodeBlock>
      <Api
        rows={[
          ['readPercentage()', 'Estimated charge, 0–100.'],
          ['readMillivolts()', 'Battery voltage in mV.'],
          ['isCharging()', 'Charge-sense pin state (if wired).'],
          ['percentageFromMillivolts(mv)', 'Static mV → percentage curve.'],
        ]}
      />

      <H2>SDCardManager</H2>
      <P>A thin, app-friendly wrapper over SdFat, plus the raw <Code>FsFile</Code> API.</P>
      <Api
        rows={[
          ['begin() / ready()', 'Mount the card; report mount state.'],
          ['listFiles(path = "/", maxFiles = 200) → vector<String>', 'Directory listing.'],
          ['readFile(path) → String', 'Read a whole file (empty on failure).'],
          ['readFileToStream(path, out, chunkSize = 256)', 'Stream a file to any Print.'],
          ['readFileToBuffer(path, buffer, bufferSize, maxBytes = 0)', 'Read into a fixed buffer.'],
          ['writeFile(path, content)', 'Write a String to a file.'],
          ['exists / remove / rename / mkdir / rmdir / ensureDirectoryExists', 'Filesystem operations.'],
          ['open(path, oflag = O_RDONLY) → FsFile', 'Raw SdFat handle for streaming.'],
        ]}
      />

      <H2>FrontlightManager</H2>
      <P>PWM frontlight with warm/cool control. Gated by <Code>FREEINK_CAP_FRONTLIGHT</Code>.</P>
      <Api
        rows={[
          ['begin()', 'Set up the PWM channel.'],
          ['on() / off()', 'Toggle the light.'],
          ['setBrightness(uint8_t percent)', 'Brightness 0–100.'],
          ['setColorTemperature(uint8_t warmPercent)', 'Warm/cool mix 0–100.'],
          ['present() / brightness()', 'Whether a frontlight exists; current brightness.'],
        ]}
      />

      <H2>BoardConfig</H2>
      <P>
        The compile-time board descriptions and the runtime-active profile. Drivers read pins,
        geometry and capabilities from <Code>BoardConfig::ACTIVE</Code>.
      </P>
      <Api
        rows={[
          ['ACTIVE', 'The runtime-active BoardProfile (defaults to DEFAULT_DEVICE).'],
          ['selectDevice(Board which) → bool', 'Set ACTIVE to a compiled-in device; false if not included.'],
          ['XTEINK_X4, XTEINK_X3, DE_LINK, M5STACK_PAPER_COLOR, MURPHY_M3', 'Built-in board profiles.'],
          ['hasTouch() / hasPwmFrontlight() / hasAudio()', 'Capability queries for the active board.'],
          ['isDeLink() / isMurphyM3() / isM5StackPaperColor()', 'Identity queries.'],
          ['LILYGO_T5_PRO_GT911', 'Ready-made GT911 touch config for a future LilyGo profile.'],
        ]}
      />

      <H2>SecureNet</H2>
      <P>
        Opt-in TLS 1.3 transport — <Code>freeink::SecureClient</Code> (an Arduino <Code>Client</Code>) and{' '}
        <Code>freeink::SecureHttpClient</Code> (an <Code>HTTPClient</Code>-compatible shim). See{' '}
        <A href="/docs/networking">Networking · TLS 1.3</A> for setup.
      </P>
    </>
  )
}
