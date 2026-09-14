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
          ['displayBufferAsync(mode = FAST_REFRESH)', 'Non-blocking refresh: push the frame, start the waveform, and return (~25 ms) while the panel refreshes from its own RAM (~0.3–2 s). The framebuffer is free to redraw immediately — so the loop keeps polling input instead of stalling. In single-buffer mode it lazily allocates one shadow buffer as the differential baseline (falls back to blocking if that fails).'],
          ['refreshBusy() → bool', 'True while an async refresh is still running on the panel.'],
          ['syncPendingAsync()', 'Block until a pending async refresh completes (no-op when none). Every blocking display call runs it first.'],
          ['displayBufferAsyncNoShadow(mode = FAST_REFRESH)', 'Async refresh that skips the single-buffer shadow allocation (identical to displayBufferAsync in dual-buffer mode) — for tight-RAM single-buffer builds.'],
          ['triggerDisplay(mode) / completeDisplay() · triggerDisplayAsync(mode) / finishDisplayAsync()', 'Split a refresh into start + finish so the app can overlap other work with the panel drive (the X4 / CrossPoint trigger-complete pattern). isRefreshPending() is true while any deferred refresh is in flight.'],
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
          ['displayGrayscaleBase(GrayscaleMode mode, fallback = HALF_REFRESH, turnOffScreen = false) → bool', 'Mode-bound base: pick Overlay or Absolute encoding. Returns false (and paints nothing) when the mode isn’t available on the active controller — check before staging planes.'],
          ['grayscaleCapabilities(GrayscaleMode mode = Overlay) → GrayscaleCapabilities', 'Query per-mode support: the host encoding (OverlayMasks / AbsolutePlanes / Unsupported) and whether an async base is available.'],
          ['combinesGrayscaleBase() → bool / supportsAsyncGrayscaleBase() → bool', 'combinesGrayscaleBase() is true where the base is deferred into the gray waveform (Paper Mono) rather than run as a separate refresh; supportsAsyncGrayscaleBase() is true where a deferred B/W refresh can serve as the base so its waveform overlaps plane staging.'],
          ['preconditionGrayscale() / preconditionGrayscale(x, y, w, h)', 'X3: fire the settle pass (full or windowed) that leaves pixels receptive to a weak grayscale nudge before an anti-aliased refresh.'],
          ['cleanupGrayscaleBuffers(bwBuffer) / grayscaleRevert()', 'Clean up after an anti-aliased refresh.'],
          ['setCustomLUT(bool enabled, lutData = nullptr)', 'Install / restore a custom waveform LUT (VCOM-safe). A board injects its own grayscale LUT through its driver config — custom LUT is the supported path now that the OTP gray4 mode has been removed.'],
          ['setHoldPeriodicFullRefresh(bool hold)', 'Hold the periodic anti-ghost full refresh through a live interaction (e.g. a slider drag) so fast refreshes never promote to full mid-gesture; clear it when the interaction ends.'],
        ]}
      />
      <H3>Absolute vs overlay grayscale</H3>
      <P>
        Anti-aliased grayscale ships in two encodings, selected through the mode-bound{' '}
        <Code>displayGrayscaleBase(mode, …)</Code>. <strong>Overlay</strong> (the default) diffs the gray
        planes against a B/W base frame — cheap, and how in-page glyph AA works. <strong>Absolute</strong>{' '}
        supplies a complete four-tone image where every pixel is present in both planes, independent of
        what was on screen — the right choice for a full-screen render like a sleep/cover overlay, where
        there's no reliable base to diff against. <strong>Direct</strong> takes those same complete planes
        but paints them in a single combined activation with the full-quality image waveform — the
        best-looking one-pass mode for a photo or cover, at the cost of a longer refresh. Absolute and
        Direct planes are accepted on the SSD1677 and the UltraChip X4 controllers (UC8179 / UC8279); the
        X3 (UC8253) and the PaperColor are overlay-only. Query{' '}
        <Code>grayscaleCapabilities(mode).encoding</Code> before staging, and let the driver force the
        next B/W refresh clean after an absolute pass.
      </P>

      <H3>Orientation</H3>
      <P>
        Panel mount orientation is not a display call — it comes from{' '}
        <Code>BoardProfile.orientation</Code> (<Code>NO_FLIP</Code> / <Code>MIRROR_X</Code> /{' '}
        <Code>MIRROR_Y</Code> / <Code>ROTATE_180</Code>) and the SSD1677 driver applies it in hardware.
        See <A href="/docs/lib-board">BoardConfig</A> and <A href="/docs/adding-a-device">Adding a device</A>.
      </P>

      <H2>Accent color planes (Spectra-6)</H2>
      <P>
        The M5 PaperColor's ED2208 Spectra-6 panel can tint black pixels with spot color through 1-bit{' '}
        <strong>accent planes</strong>. Set a plane into one of four slots; a set bit recolors the
        matching black pixel to that slot's Spectra color, and where slots overlap the lowest-numbered
        one wins. Because the pigments only settle on a full, uninterrupted waveform, accents appear on{' '}
        <strong>complete-waveform refreshes</strong> only — standing images (clocks, dashboards), not
        page turns.
      </P>
      <ApiTable
        rows={[
          ['setAccentPlaneSlot(uint8_t slot, const uint8_t* plane, uint8_t colorCode)', 'Attach a 1-bit accent plane to slot 0–3 (plane = nullptr clears it). colorCode is a Spectra-6 constant: SPECTRA_BLACK / WHITE / YELLOW / RED / BLUE / GREEN. No-op on non-Spectra panels.'],
          ['setFullRefreshCompletesWaveform(bool enabled)', 'When enabled, every FULL_REFRESH runs the panel’s complete color waveform (slower, DC-balanced, accents settle); disabled (default) keeps Full an interrupted pass for speed. Standing-image apps enable it; readers leave it off.'],
          ['requestCompleteWaveformNextRefresh()', 'One-shot: run the complete waveform on just the next FULL_REFRESH, for a transient color render without changing the mode.'],
        ]}
      />

      <H2>Framebuffer memory</H2>
      <P>
        The facade owns the write and previous-frame framebuffers. They can be freed and restored so
        a memory-tight phase (a transient web UI, chapter compilation) can reclaim the ~100 KB of PSRAM:
      </P>
      <ApiTable
        rows={[
          ['releaseBuffers() / reallocBuffers()', 'Free both framebuffers back to the heap, then bring them back (white) when needed — for a transient session that reclaims the ~100 KB. After reallocBuffers() the caller must fully redraw; it returns false if the heap can’t supply the buffers (display then unusable).'],
          ['releaseSecondaryBuffer() / reallocSecondaryBuffer() / hasSecondaryBuffer()', 'Free only the previous-frame buffer (~48–52 KB); B/W and fast differential refresh keep working (the driver re-seeds RAM when prev is null), but grayscale AA is unavailable until it’s reallocated.'],
          ['borrowSecondaryBuffer(size_t* size) → uint8_t* / returnSecondaryBuffer()', 'Lend the secondary buffer’s memory to the app as scratch without freeing it (drops to single-buffer semantics). The block never enters the heap, so returning it can’t fail and can’t fragment — unlike release/realloc.'],
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
