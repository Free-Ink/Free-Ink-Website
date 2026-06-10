import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function AudioManager() {
  return (
    <>
      <Lead>
        WAV (16-bit PCM) playback through the I2S codec described by{' '}
        <Code>BoardConfig::ACTIVE.audio</Code>. Gated by <Code>FREEINK_CAP_AUDIO</Code>, which defaults
        on for the Murphy M3 (an ES8388-compatible stereo codec) and off elsewhere; inert on boards
        with no audio path.
      </Lead>

      <P>
        Playback runs in a dedicated FreeRTOS task, so <Code>play()</Code> returns immediately. With{' '}
        <Code>loop=true</Code> the source is rewound and replayed until <Code>stop()</Code> — the alarm
        use case. The WAV source is a pair of callbacks rather than a <Code>FILE</Code> / Stream, so the
        SDK stays storage-agnostic: firmware can serve bytes from LittleFS, SD or a PROGMEM array with
        one API.
      </P>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() → bool', 'Bring up the codec + enable pin. False when the active board has no audio path (treat audio as absent).'],
          ['present() → bool', 'Whether the active board has an audio path.'],
          ['setVolume(uint8_t percent)', 'Analog output volume 0–100 (maps onto the codec OUT1/OUT2 registers).'],
          ['play(const WavSource& source, bool loop) → bool', 'Start WAV playback (16-bit PCM, mono/stereo, 8–48 kHz). Stops any current playback first; loop replays until stop().'],
          ['playBuffer(const uint8_t* data, size_t len, bool loop) → bool', 'Convenience: play from a memory buffer (e.g. an embedded default sound).'],
          ['stop() / isPlaying()', 'Stop playback; query whether the task is streaming.'],
          ['powerDown()', 'Codec power-down (CHIPPOWER off). begin() restores it.'],
        ]}
      />

      <H2>WavSource</H2>
      <P>
        The source is two callbacks — <Code>read</Code> copies up to <Code>len</Code> bytes and returns
        the count (0 = EOF, &lt;0 = error); <Code>seek</Code> does an absolute seek from the start of the
        WAV for chunk walking and loop rewind (return <Code>false</Code> if unsupported, in which case
        loop and header re-parse fail).
      </P>
      <CodeBlock lang="cpp">{`AudioManager audio;
if (audio.begin()) {                 // false if the board has no codec
  audio.setVolume(70);
  audio.playBuffer(alarmWav, alarmWavLen, /*loop=*/true);
  // ... later ...
  audio.stop();
}`}</CodeBlock>

      <P>
        The codec contract for the Murphy M3 (ES8388-compatible at I²C <Code>0x10</Code> on the shared
        touch bus, I2S master) was recovered from the OEM firmware and lives in the board profile, so
        nothing audio-specific is hardcoded in generic code. See{' '}
        <A href="/docs/lib-board">BoardConfig</A> and{' '}
        <A href="/docs/build-composition">Build composition</A>.
      </P>
    </>
  )
}
