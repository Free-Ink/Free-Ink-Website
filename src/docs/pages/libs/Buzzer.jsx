import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Buzzer() {
  return (
    <>
      <Lead>
        Square-wave tones on a passive buzzer via the ESP32 LEDC PWM, on the <Code>audio.buzzer</Code>{' '}
        pin in the board profile. Gated by <Code>FREEINK_CAP_BUZZER</Code>, which defaults on for the{' '}
        <A href="/docs/devices">Sticky</A> and Murphy M3, and off elsewhere.
      </Lead>

      <P>
        This is a <strong>tone device</strong>, not a PCM codec — it's independent of{' '}
        <A href="/docs/lib-audio">AudioManager</A>, and a board can carry both (the Murphy M3 has an
        ES8388 codec <em>and</em> a buzzer). <Code>tone()</Code> with a duration blocks and self-stops;
        with no duration it runs until <Code>noTone()</Code>.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Attach LEDC PWM to the buzzer pin. False when the board has no buzzer.'],
          ['present() → bool', 'Whether the buzzer initialized.'],
          ['tone(uint32_t freqHz, uint32_t durationMs = 0)', 'Play a square-wave tone. durationMs > 0 blocks then stops; 0 runs continuously until noTone().'],
          ['beep()', 'A short default beep (2 kHz, 80 ms).'],
          ['noTone()', 'Silence a continuous tone.'],
          ['end()', 'Release the LEDC channel and pin. begin() re-attaches.'],
        ]}
      />

      <CodeBlock lang="cpp">{`Buzzer buzzer;
if (buzzer.begin()) {
  buzzer.beep();              // short confirmation blip
  buzzer.tone(880, 200);     // an A5 for 200 ms
}`}</CodeBlock>

      <P>
        See <A href="/docs/lib-board">BoardConfig</A> for the <Code>audio.buzzer</Code> pin and{' '}
        <A href="/docs/build-composition">Build composition</A> for the capability flag.
      </P>
    </>
  )
}
