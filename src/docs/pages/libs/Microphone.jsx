import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function Microphone() {
  return (
    <>
      <Lead>
        PDM microphone capture to 16-bit PCM, described by <Code>BoardConfig::ACTIVE.mic</Code>. Gated
        by <Code>FREEINK_CAP_MIC</Code>, which defaults on for the <A href="/docs/devices">Sticky</A> and
        off elsewhere; inert on boards with no microphone.
      </Lead>

      <P>
        It wraps the ESP-IDF <Code>i2s_pdm</Code> RX driver: <Code>begin()</Code> raises the mic power
        rail, settles, and starts the PDM clock; <Code>read()</Code> pulls mono 16-bit samples out of the
        I2S FIFO. The SDK stays storage-agnostic — the caller owns whatever it does with the samples
        (ring buffer, WAV file, on-device wake-word).
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin(uint32_t sampleRate = 16000) → bool', 'Power the mic rail and start PDM RX at the given rate. False when the active board has no mic or init fails.'],
          ['present() → bool', 'Whether the active board has a mic and begin() succeeded.'],
          ['read(int16_t* dst, size_t maxSamples, uint32_t timeoutMs = 100) → int', 'Read up to maxSamples mono 16-bit PCM samples; blocks up to timeoutMs. Returns the count (0 = timeout, <0 = error / not begun).'],
          ['end()', 'Stop RX and drop the mic rail. begin() restarts it.'],
          ['sampleRate() → uint32_t', 'The active sample rate.'],
        ]}
      />

      <CodeBlock lang="cpp">{`Microphone mic;
if (mic.begin(16000)) {           // false if the board has no mic
  int16_t buf[256];
  int n = mic.read(buf, 256);     // mono 16-bit PCM
  // ... consume n samples ...
  mic.end();
}`}</CodeBlock>

      <P>
        Pins (PDM clock out, data in, and an active-polarity power-enable) come from the{' '}
        <Code>MicConfig</Code> in the board profile, so nothing mic-specific is hardcoded in generic
        code. See <A href="/docs/lib-board">BoardConfig</A> and{' '}
        <A href="/docs/build-composition">Build composition</A>.
      </P>
    </>
  )
}
