import { Lead, P, H2, A, Code, ApiTable } from '../../prose.jsx'

export default function InputManager() {
  return (
    <>
      <Lead>
        Buttons plus optional capacitive touch behind one object. Call <Code>update()</Code> each loop,
        then query edge/level state.
      </Lead>

      <H2>Buttons</H2>
      <ApiTable
        rows={[
          ['begin() / update()', 'Initialize; sample inputs once per loop.'],
          ['isPressed(buttonIndex)', 'Level: button currently held.'],
          ['wasPressed(buttonIndex) / wasReleased(buttonIndex)', 'Edge: press / release since last update.'],
          ['wasAnyPressed() / wasAnyReleased()', 'Any-button edge.'],
          ['getState() / getButtonName(i)', 'Raw button bitmask; human name for a button.'],
          ['isDebouncePending() → bool', 'True while a raw state change is still inside the debounce window (a change commits after two matching samples). Slow-polling hosts (a sleep-sliced idle loop) should re-poll quickly while this is set, or a press shorter than the poll period is dropped.'],
          ['isPowerButtonPhysicallyPressed() → bool', 'Raw power-GPIO level, read before any click/hold classification — for a shutdown confirm screen or a wake check. False when the board has no power button.'],
          ['BTN_BACK, BTN_CONFIRM, BTN_LEFT, BTN_RIGHT, BTN_UP, BTN_DOWN, BTN_POWER', 'Button index constants.'],
        ]}
      />

      <H2>Touch</H2>
      <P>
        Gated by <Code>FREEINK_CAP_TOUCH</Code>; inert on boards without a touch controller. Two
        controllers are supported — CHSC6x and GT911 (either IRQ-driven or polled per board). The
        InputManager returns <strong>panel-native</strong> coordinates and the app owns rotation; a
        rotated or mirrored digitizer is corrected SDK-side by the board profile's{' '}
        <Code>TouchConfig</Code> (<Code>swapXY</Code> / <Code>flipX</Code> / <Code>flipY</Code>). See{' '}
        <A href="/docs/devices">Supported devices</A> for per-board touch details.
      </P>
      <ApiTable
        rows={[
          ['hasTouch()', 'Whether the active board has a touch controller.'],
          ['getTouchPoint() → TouchPoint{ valid, x, y }', 'Current touch point.'],
          ['isTouchPressed()', 'Level: touched now.'],
          ['isTouchHeldAt(float& nx, float& ny) → bool', 'True while a touch is down, writing the current contact position (no tap-slop gate, so it follows a moving finger) — for drag interactions like sliders. The caller owns any threshold/hysteresis.'],
          ['wasTouchPressed() / wasTouchReleased()', 'Edge: touch down / up.'],
          ['wasTouchActivity() → bool', 'Edge: any touch press or release happened this frame — the touch analogue of wasAnyPressed(), for resetting idle/sleep timers. False on non-touch boards.'],
          ['wasTouchTap(float& nx, float& ny) → bool', 'Edge: a tap gesture released this frame, returning the normalized panel-native touch-down position (not the lift point — the reported centroid drifts 10–20 px as a finger rolls off, so routing to touch-down keeps small targets like steppers accurate). The app maps the coords to its logical frame. False (outputs untouched) if no release this frame or no touch HW.'],
          ['wasTouchPressedAt(float& nx, float& ny) → bool', 'Press-edge analogue of wasTouchTap: true on the frame a touch begins, returning the normalized touch-down position — so a control can highlight under the finger on press, then activate on release.'],
          ['wasSwipe(float& nxStart, float& nyStart, float& nxEnd, float& nyEnd) → bool', 'Edge: a flick released this frame (contact moved ≥60 px within 700 ms), returning normalized start (touch-down) and end (release) positions. A swipe also raises wasTouchTap(); check wasSwipe() first to disambiguate. The app maps both points and takes the dominant axis for direction.'],
          ['lastTouchHeldMs() → unsigned long', 'Duration of the last touch contact, latched on release — a raw primitive for an app-side tap-vs-long-press policy. 0 with no touch HW.'],
          ['wasHomeKeyPressed() / wasHomeKeyTapped() / wasHomeKeyLongPressed()', 'Edges for the GT911 capacitive home key: raw press, short-press release (the primary “home” action), and a held press past ~700 ms. A home-key press now also counts toward wasTouchActivity(). Always false on controllers without one.'],
        ]}
      />

      <H2>Multi-touch gestures</H2>
      <P>
        GT911 boards report up to <strong>four</strong> simultaneous contacts, so InputManager derives
        two-finger gestures on top of the single-contact API. <Code>supportsMultiTouch()</Code> is true
        only on those controllers, and <Code>getTouchSnapshot()</Code> hands back the raw contact set
        (<Code>TouchSnapshot</Code>: a count plus <Code>MultiTouchPoint</Code>s carrying stable GT911
        track ids). The derived gestures come as edge queries (or matching <Code>pop…</Code> drains for
        the background queue):
      </P>
      <ApiTable
        rows={[
          ['supportsMultiTouch() → bool / getTouchSnapshot() → TouchSnapshot', 'Whether the controller reports multiple contacts, and the latest set (up to 4) with stable track ids.'],
          ['wasMultiTouchSwipe(uint8_t& contacts, float& nxStart, float& nyStart, float& nxEnd, float& nyEnd, unsigned long& ms) → bool', 'A 2–4 finger translation released this frame (normalized start/end, contact count, duration).'],
          ['wasMultiTouchPinch(float& scale, float& nxCenter, float& nyCenter, unsigned long& ms) → bool', 'A two-finger pinch/spread: scale < 1 pinches in (zoom out), > 1 spreads (zoom in), about the given center.'],
          ['wasMultiTouchRotation(float& degrees, float& nxCenter, float& nyCenter, unsigned long& ms) → bool', 'A two-finger rotation in degrees about the center.'],
        ]}
      />

      <H2>Background polling</H2>
      <P>
        On e-paper a slow refresh blocks the main loop, so a button press that lands mid-refresh is
        lost. Optional FreeRTOS-backed polling decouples input from rendering: a task samples the
        buttons on its own and queues each press edge, and the app drains them after the refresh. When
        async polling is active the app must <strong>not</strong> call <Code>update()</Code> /{' '}
        <Code>wasPressed()</Code> — the task owns the edge state; drain with <Code>popPress()</Code>{' '}
        instead.
      </P>
      <ApiTable
        rows={[
          ['beginAsync(taskPriority = 2, pollMs = 15, queueLen = 32)', 'Spawn the polling task; it latches each press (a BTN_* index) into an internal queue. No-op if already started.'],
          ['popPress(uint8_t& button) → bool', 'Pop the next queued button index into button. False when nothing is pending (or async polling was never started).'],
          ['popTouchTap(float& nx, float& ny) → bool', 'Pop the next queued touch tap (async polling latches taps too), returning its normalized panel-native position. So a tap that lands mid-refresh survives and drains here — the touch analogue of popPress.'],
        ]}
      />

      <H2>Xteink button ladder</H2>
      <P>
        On the Xteink X3/X4 the six buttons are resistor dividers multiplexed onto two ADC pins
        (Back/Confirm/Left/Right on group 1, Up/Down on group 2). A button-test or calibration screen can
        read the raw ladder to spot a drifted divider whose voltage no longer lands in the band the
        firmware expects — visible from the raw value regardless of how it classifies.
      </P>
      <ApiTable
        rows={[
          ['readButtonAdc(ButtonAdcSample& g1, ButtonAdcSample& g2)', 'Synchronously sample both button-group ADC pins (safe alongside async polling). Boards without the ladder report raw = -1, button = -1.'],
          ['ButtonAdcSample { pin, raw, button }', 'The GPIO sampled, its raw analogRead() value, and the classified BTN_* index (-1 = no band matched).'],
          ['setSharedConfirmPowerShortPressEmitsPower(bool)', 'For boards that wire OK/confirm and power/wake to one GPIO (e.g. Sticky): default a short click emits CONFIRM and a hold (≥400 ms) emits POWER; flip short clicks to POWER for a “short power click sleeps” option.'],
        ]}
      />
    </>
  )
}
