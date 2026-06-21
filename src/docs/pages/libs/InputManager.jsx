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
          ['wasTouchPressed() / wasTouchReleased()', 'Edge: touch down / up.'],
          ['wasTouchActivity() → bool', 'Edge: any touch press or release happened this frame — the touch analogue of wasAnyPressed(), for resetting idle/sleep timers. False on non-touch boards.'],
          ['wasTouchTap(float& nx, float& ny) → bool', 'Edge: a tap gesture released this frame, returning the normalized panel-native touch-down position (not the lift point — the reported centroid drifts 10–20 px as a finger rolls off, so routing to touch-down keeps small targets like steppers accurate). The app maps the coords to its logical frame. False (outputs untouched) if no release this frame or no touch HW.'],
          ['wasTouchPressedAt(float& nx, float& ny) → bool', 'Press-edge analogue of wasTouchTap: true on the frame a touch begins, returning the normalized touch-down position — so a control can highlight under the finger on press, then activate on release.'],
          ['wasSwipe(float& nxStart, float& nyStart, float& nxEnd, float& nyEnd) → bool', 'Edge: a flick released this frame (contact moved ≥60 px within 700 ms), returning normalized start (touch-down) and end (release) positions. A swipe also raises wasTouchTap(); check wasSwipe() first to disambiguate. The app maps both points and takes the dominant axis for direction.'],
          ['lastTouchHeldMs() → unsigned long', 'Duration of the last touch contact, latched on release — a raw primitive for an app-side tap-vs-long-press policy. 0 with no touch HW.'],
          ['wasHomeKeyPressed()', 'Edge: GT911 capacitive home key pressed (status bit 0x10). Always false on controllers without one.'],
        ]}
      />
    </>
  )
}
