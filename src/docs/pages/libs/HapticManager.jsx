import { Lead, P, H2, A, Code, CodeBlock, ApiTable } from '../../prose.jsx'

export default function HapticManager() {
  return (
    <>
      <Lead>
        A single owner of the board's vibration motor, driven over PWM. It's a singleton with timer-task
        playback — <Code>pulse()</Code> and <Code>play()</Code> return immediately and need no update
        loop. Gated by <Code>FREEINK_CAP_HAPTIC</Code>, which is on only for boards with a motor (the{' '}
        <A href="/docs/devices">Metalio E-Ink 4</A>); everywhere else it links a stub and{' '}
        <Code>supported()</Code> returns false.
      </Lead>

      <ApiTable
        rows={[
          ['getInstance() → HapticManager&', 'The singleton accessor.'],
          ['supported() → bool', 'Capability compiled in and the active board actually has a motor.'],
          ['begin() → bool / present() → bool / end()', 'Attach the PWM output (silent at first); present() once initialized; end() releases it (begin() can re-attach). Timer/PWM errors are retryable.'],
          ['pulse(uint32_t ms = 35, uint8_t intensity = 255) → bool', 'One buzz; replaces any current playback.'],
          ['play(const Step* steps, size_t count, uint16_t repeats = 1) → bool', 'Play a copied pattern (≤ 32 Step{ ms, intensity }; intensity 0 = pause) with a repeat count. An invalid request leaves current playback intact.'],
          ['stop() / isPlaying() → bool', 'Stop; whether a pattern is mid-play (pauses included).'],
          ['setEnabled(bool) / enabled()', 'Gate: disabling stops playback; enabling does not resume.'],
          ['setIntensity(uint8_t) / intensity()', 'Master gain 0–255, applied to every step immediately.'],
        ]}
      />

      <CodeBlock lang="cpp">{`#include <HapticManager.h>
using freeink::HapticManager;

auto& haptics = HapticManager::getInstance();
if (haptics.supported()) haptics.begin();

haptics.pulse();                    // a 35 ms tap

// a two-buzz confirm pattern:
const HapticManager::Step ok[] = {{40, 255}, {60, 0}, {40, 255}};
haptics.play(ok, 3);`}</CodeBlock>

      <P>
        Call it from task context only. See <A href="/docs/lib-board">BoardConfig</A> for the{' '}
        <Code>HapticConfig</Code> fields (motor GPIO + PWM frequency) and{' '}
        <A href="/docs/build-composition">Build composition</A> for the capability flag.
      </P>
    </>
  )
}
