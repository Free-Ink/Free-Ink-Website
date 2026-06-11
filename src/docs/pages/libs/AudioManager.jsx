import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function AudioManager() {
  return (
    <>
      <Lead>
        WAV (16-bit PCM) playback through the I2S codec described by{' '}
        <Code>BoardConfig::ACTIVE.audio</Code>. Gated by <Code>FREEINK_CAP_AUDIO</Code>, which defaults
        on for the Murphy M3 (an ES8388-compatible stereo codec) and the M5 PaperColor (an ES8311 mono
        codec driving an AW8737A speaker amp), and off elsewhere; inert on boards with no audio path.
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
          ['setVolume(uint8_t percent)', 'Output volume 0–100, mapped onto the active codec’s volume registers (ES8388 OUT1/OUT2 pairs, or the single ES8311 DAC register).'],
          ['play(const WavSource& source, bool loop) → bool', 'Start WAV playback (16-bit PCM, mono/stereo, 8–48 kHz). Stops any current playback first; unmutes the DAC, primes the I2S line with silence, then raises the speaker amp (priming first avoids an audible amp pop); loop replays until stop().'],
          ['playBuffer(const uint8_t* data, size_t len, bool loop) → bool', 'Convenience: play from a memory buffer (e.g. an embedded default sound).'],
          ['stop() / isPlaying()', 'Stop playback (drops the amp and mutes the DAC so nothing residual reaches the output); query whether the task is streaming.'],
          ['powerDown()', 'Full power-down: stop, drop the speaker amp, and cut the codec rail (ES8388 CHIPPOWER off). begin() restores it.'],
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

      <H2>Codecs</H2>
      <P>
        Two control codecs are supported, selected per board by <Code>AudioConfig::output</Code> — all
        codec-specific register sequences live in <Code>AudioManager</Code>, and the pins/addresses live
        in the board profile, so nothing audio-specific is hardcoded in generic code:
      </P>
      <ApiTable
        rows={[
          ['I2sEs8388 — Murphy M3', 'ES8388-compatible stereo codec at I²C 0x10 on the shared touch bus, I2S master. The register contract was recovered from the OEM firmware. No separate amp-enable pin.'],
          ['I2sEs8311 — M5 PaperColor', 'ES8311 mono codec at I²C 0x18 on the system bus, mirroring M5Unified’s speaker bring-up. The codec derives its MCLK from BCLK (no MCLK line), so one init is sample-rate-agnostic. A separate AW8737A speaker amp (ampEnable / SPK_EN) is raised only while playing.'],
        ]}
      />
      <P>
        See <A href="/docs/lib-board">BoardConfig</A> for the <Code>AudioConfig</Code> fields (including{' '}
        <Code>ampEnable</Code>) and <A href="/docs/build-composition">Build composition</A> for the
        capability flag.
      </P>
    </>
  )
}
