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
        controllers are supported — CHSC6x (IRQ-driven) and GT911 (polled). Coordinates are
        raw-panel-oriented, so the app owns rotation. See{' '}
        <A href="/docs/devices">Supported devices</A> for per-board touch details.
      </P>
      <ApiTable
        rows={[
          ['hasTouch()', 'Whether the active board has a touch controller.'],
          ['getTouchPoint() → TouchPoint{ valid, x, y }', 'Current touch point.'],
          ['isTouchPressed()', 'Level: touched now.'],
          ['wasTouchPressed() / wasTouchReleased()', 'Edge: touch down / up.'],
          ['wasTouchTap(float& nx, float& ny) → bool', 'Edge: a tap gesture released this frame, returning the normalized panel-native touch-down position (not the lift point — the reported centroid drifts 10–20 px as a finger rolls off, so routing to touch-down keeps small targets like steppers accurate). The app maps the coords to its logical frame. False (outputs untouched) if no release this frame or no touch HW.'],
          ['wasHomeKeyPressed()', 'Edge: GT911 capacitive home key pressed (status bit 0x10). Always false on controllers without one.'],
        ]}
      />
    </>
  )
}
