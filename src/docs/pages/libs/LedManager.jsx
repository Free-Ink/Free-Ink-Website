import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function LedManager() {
  return (
    <>
      <Lead>
        Color, brightness and non-blocking flashes for a board's addressable RGB LEDs, described by{' '}
        <Code>BoardConfig::ACTIVE.leds</Code>. Gated by <Code>FREEINK_CAP_LED</Code>, which defaults on
        for the M5 PaperColor (two GRB LEDs on GPIO21) and off elsewhere; inert on boards with no LEDs.
      </Lead>

      <P>
        The API is deliberately small and independent of M5Unified. The driver <strong>bit-bangs a
        WS2812 / SK6812-compatible 800 kHz signal</strong> directly on the data GPIO with cycle-accurate
        timing (<Code>T0H</Code> ≈ 350 ns, <Code>T1H</Code> ≈ 700 ns, 1.25 µs bit cell), so interrupts
        are masked for only ~60 µs per <Code>show()</Code> with two LEDs. Colors are stored unscaled;{' '}
        <Code>setBrightness()</Code> applies a global scale at write time.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Enable the LED power rail (if any) and initialize the data line. False when the active board has no LEDs.'],
          ['present() → bool', 'Whether the active board has an LED path.'],
          ['count() → uint8_t', 'Number of LEDs on the active board.'],
          ['setBrightness(uint8_t) / brightness()', 'Global 0–255 brightness scale applied at write time; stored colors stay full-range.'],
          ['setColor(uint8_t index, LedColor) / setAll(LedColor)', 'Set one LED, or every LED, in the buffer (call show() to push).'],
          ['color(uint8_t index) → LedColor', 'Read back a buffered color.'],
          ['show() / clear()', 'Push the buffer to the physical LEDs; clear() blanks the buffer and shows it.'],
          ['flash(LedColor, count=1, onMs=120, offMs=120)', 'Start a non-blocking blink sequence (saves the current colors first).'],
          ['update()', 'Advance any in-progress flash; call once per loop().'],
          ['isFlashing() / stopFlash(bool restore=true)', 'Query/stop a flash; restore returns the saved colors.'],
        ]}
      />

      <H2>LedColor</H2>
      <P>
        A plain <Code>{'{ r, g, b }'}</Code> struct (0–255 each) with named helpers —{' '}
        <Code>LedColor::red()</Code>, <Code>green()</Code>, <Code>blue()</Code>, <Code>white()</Code>,{' '}
        <Code>yellow()</Code>, <Code>cyan()</Code>, <Code>magenta()</Code>, <Code>black()</Code> — plus{' '}
        <Code>LedColor::rgb(r, g, b)</Code>. The board profile's <Code>colorOrder</Code> (GRB or RGB)
        decides the wire order, so app code always works in RGB.
      </P>

      <H2>Non-blocking flashes</H2>
      <P>
        <Code>flash()</Code> snapshots the current colors, blinks the requested color a number of times,
        then restores the snapshot on completion (or on <Code>stopFlash(true)</Code>). Nothing blocks —{' '}
        <Code>update()</Code> advances the sequence each loop, so a status blink rides alongside normal
        rendering.
      </P>
      <CodeBlock lang="cpp">{`LedManager leds;
if (leds.begin()) {            // false if the board has no LEDs
  leds.setBrightness(64);
  leds.setAll(LedColor::blue());
  leds.show();
  leds.flash(LedColor::green(), 3);   // blink 3× then restore blue
}

void loop() {
  leds.update();              // advances non-blocking flashes
}`}</CodeBlock>

      <H2>Wiring and power</H2>
      <P>
        The board profile carries the data pin, LED count, color order and a{' '}
        <Code>pmicRgbPower</Code> flag. On the PaperColor the two LEDs sit behind the{' '}
        <strong>M5PM1 PMIC's RGB LDO rail</strong>, so <Code>begin()</Code> enables that rail over the
        internal I²C bus before driving any data. It also waits out the LEDs' power-on reset and issues a{' '}
        <strong>double clear</strong> — a frame sent too early mis-latches into a stuck (typically green,
        the first GRB byte) pixel, and the second clear one latch period later makes init reliable on
        marginal silicon. See <A href="/docs/lib-board">BoardConfig</A> for the <Code>LedConfig</Code>{' '}
        fields and <A href="/docs/build-composition">Build composition</A> for the capability flag.
      </P>
    </>
  )
}
