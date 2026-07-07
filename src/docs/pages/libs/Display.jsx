import { Lead, P, H2, H3, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Display() {
  return (
    <>
      <Lead>
        The display facade — <Code>freeink::FreeInkDisplay</Code>, aliased to <Code>EInkDisplay</Code>.
        It owns the framebuffer and geometry and delegates to a panel driver selected at{' '}
        <Code>begin()</Code>. See <A href="/docs/architecture">Architecture</A> for how the facade,
        drivers and bus fit together.
      </Lead>

      <P>Construct it from the active board's display SPI pins:</P>
      <CodeBlock lang="cpp">{`FreeInkDisplay(int8_t sclk, int8_t mosi, int8_t cs,
               int8_t dc, int8_t rst, int8_t busy);`}</CodeBlock>

      <H2>Lifecycle &amp; panel selection</H2>
      <ApiTable
        rows={[
          ['begin()', 'Initialize the bus and select the panel driver for the active profile.'],
          ['setDisplayX3()', 'Switch to the X3 profile + UC8253 driver (before begin(), on a C3 X3/X4 binary).'],
          ['setDisplayM5PaperColor()', 'Switch to the M5 PaperColor profile + ED2208 driver.'],
          ['requestCompleteWaveformNextRefresh()', 'M5 only: run the next refresh’s OTP waveform to completion (one-shot).'],
          ['deepSleep()', 'Power the panel down.'],
        ]}
      />

      <H2>Geometry</H2>
      <ApiTable
        rows={[
          ['getDisplayWidth() / getDisplayHeight()', 'Active panel dimensions in pixels.'],
          ['getDisplayWidthBytes()', 'Row stride in bytes.'],
          ['getBufferSize()', 'Framebuffer size in bytes.'],
          ['DISPLAY_WIDTH, DISPLAY_HEIGHT, BUFFER_SIZE, …', 'Compile-time constants (plus X3_* variants).'],
        ]}
      />

      <H2>Drawing into the framebuffer</H2>
      <ApiTable
        rows={[
          ['clearScreen(uint8_t color = 0xFF)', 'Fill the buffer (0xFF = white).'],
          ['drawImage(data, x, y, w, h, fromProgmem = false)', 'Blit a 1-bpp bitmap.'],
          ['drawImageTransparent(data, x, y, w, h, fromProgmem = false)', 'Blit, skipping background pixels (icons).'],
          ['setFramebuffer(const uint8_t* bwBuffer)', 'Replace the B/W buffer wholesale.'],
          ['getFrameBuffer()', 'Pointer to the active framebuffer.'],
          ['swapBuffers()', 'Swap the double-buffered framebuffers.'],
        ]}
      />

      <H2>Refresh</H2>
      <P>
        Refresh modes: <Code>FULL_REFRESH</Code> / <Code>HALF_REFRESH</Code> / <Code>FAST_REFRESH</Code>.
      </P>
      <ApiTable
        rows={[
          ['displayBuffer(mode = FAST_REFRESH, turnOffScreen = false)', 'Push the framebuffer to the panel.'],
          ['displayWindow(x, y, w, h, turnOffScreen = false)', 'Partial update of a region.'],
          ['refreshDisplay(mode = FAST_REFRESH, turnOffScreen = false)', 'Refresh without rewriting the buffer.'],
          ['requestResync(uint8_t settlePasses = 0)', 'X3: one-shot full resync on next update.'],
          ['skipInitialResync()', 'Skip the first-update resync.'],
          ['setFastRefreshCutoffMs(uint16_t ms) / fastRefreshCutoffMs()', 'M5 PaperColor: tune the interrupted-refresh cutoff in ms (0 = driver default). The cut now anchors to the BUSY falling edge — when the drive actually starts — so the timing is deterministic and sweepable on a live panel.'],
        ]}
      />

      <H2>Grayscale / anti-aliased</H2>
      <ApiTable
        rows={[
          ['copyGrayscaleBuffers(lsb, msb)', 'Load both gray planes.'],
          ['copyGrayscaleLsbBuffers(lsb) / copyGrayscaleMsbBuffers(msb)', 'Load one plane.'],
          ['writeGrayscalePlaneStrip(plane, rows, yStart, numRows)', 'Stream a row band to controller RAM (plane = GRAY_PLANE_LSB/MSB).'],
          ['supportsStripGrayscale()', 'Whether the active driver supports strip streaming.'],
          ['displayGrayBuffer(turnOffScreen = false, lut = nullptr, factoryMode = false)', 'Push the gray planes.'],
          ['displayGrayscaleBase(fallback = HALF_REFRESH, turnOffScreen = false)', 'Display the framebuffer as the base frame under a grayscale overlay. On X3 this fires the OEM differential base pass; other panels fall back to a normal refresh in the fallback mode.'],
          ['preconditionGrayscale() / preconditionGrayscale(x, y, w, h)', 'X3: fire the settle pass (full or windowed) that leaves pixels receptive to a weak grayscale nudge before an anti-aliased refresh.'],
          ['cleanupGrayscaleBuffers(bwBuffer) / grayscaleRevert()', 'Clean up after an anti-aliased refresh.'],
          ['setCustomLUT(bool enabled, lutData = nullptr)', 'Install / restore a custom waveform LUT (VCOM-safe). A board injects its own grayscale LUT through its driver config — custom LUT is the supported path now that the OTP gray4 mode has been removed.'],
        ]}
      />

      <H3>Orientation</H3>
      <P>
        Panel mount orientation is not a display call — it comes from{' '}
        <Code>BoardProfile.orientation</Code> (<Code>NO_FLIP</Code> / <Code>MIRROR_X</Code> /{' '}
        <Code>MIRROR_Y</Code> / <Code>ROTATE_180</Code>) and the SSD1677 driver applies it in hardware.
        See <A href="/docs/lib-board">BoardConfig</A> and <A href="/docs/adding-a-device">Adding a device</A>.
      </P>

      <H2>Framebuffer memory</H2>
      <P>
        The facade owns the write and previous-frame framebuffers. They can be freed and restored so
        a memory-tight phase (a transient web UI, chapter compilation) can reclaim the ~100 KB of PSRAM:
      </P>
      <ApiTable
        rows={[
          ['releaseBuffers()', 'Free both framebuffers back to the heap. No display ops until begin() is called again — for sessions that reboot on exit. Safe no-op if already released.'],
          ['releaseSecondaryBuffer() / reallocSecondaryBuffer() / hasSecondaryBuffer()', 'Free only the previous-frame buffer (~48–52 KB); B/W and fast differential refresh keep working (the driver re-seeds RAM when prev is null), but grayscale AA is unavailable until it’s reallocated.'],
          ['syncWriteBufferFromActive()', 'Copy the just-displayed frame back into the write buffer, so you can patch a few regions and re-display instead of fully re-rendering. No-op in single-buffer mode.'],
          ['cleanupGrayscaleWithPreviousBuffer()', 'Restore the B/W baseline after a grayscale refresh, using the active buffer (falls back when the secondary is released).'],
        ]}
      />

      <H2>BUSY-wait hooks</H2>
      <P>
        A refresh blocks for ~0.3–2 s while the CPU only polls the panel's BUSY pin. Optional hooks let
        firmware apply its own power policy for that window without the SDK knowing it:
      </P>
      <ApiTable
        rows={[
          ['setBusyWaitHooks(begin, end)', 'Plain function-pointer pair fired around a long wait (begin fires once a wait exceeds ~20 ms, so short command waits don’t pay) — e.g. drop the CPU clock, then restore.'],
          ['setBusyWaitSliceHook(fn)', 'Once a wait is proven long, replaces the poll delay with your hook (receives the BUSY pin + level) so firmware can sleep through the refresh instead of busy-polling.'],
        ]}
      />
    </>
  )
}
