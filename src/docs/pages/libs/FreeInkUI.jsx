import { Lead, P, H2, H3, A, Ul, Li, Code, CodeBlock, Table, Callout } from '../../prose.jsx'

export default function FreeInkUI() {
  return (
    <>
      <Lead>
        A memory-bounded, <strong>immediate-mode</strong> UI layer for e-paper firmware. It sits above
        a display driver and an input source while staying independent of any one application: apps
        plug in their own renderer, fonts, icons, themes, localization strings and screen state through
        small adapter interfaces. Think "Tailwind for e-ink" without a web-style runtime.
      </Lead>

      <P>
        FreeInkUI (<Code>libs/ui/FreeInkUI</Code>) is <strong>optional</strong> — it ships as its own
        library and the rest of the SDK builds without it. It is freestanding C++17 with no Arduino or
        ESP-IDF dependency, so the layout, routing, focus and virtualization logic run in plain host
        unit tests (<Code>libs/ui/FreeInkUI/test/host/run.sh</Code>).
      </P>

      <H2>Design constraints</H2>
      <Ul>
        <Li>No heap allocation by default — fixed-capacity interaction tables.</Li>
        <Li>Borrowed strings and asset pointers; app-owned state and props.</Li>
        <Li>Virtualized lists/grids instead of one node per item.</Li>
        <Li>
          No file IO and no JSON in the UI layer — the app parses themes and resolves assets and hands
          in the in-memory shapes.
        </Li>
        <Li>
          Touch, GPIO buttons, focus navigation and gestures all route to semantic action IDs —
          components never reference physical button names or board pins.
        </Li>
      </Ul>

      <H2>Core flow</H2>
      <P>
        Each frame you build an input snapshot, wrap a draw target, lay out fixed slots, render
        components into the slot rects, then call <Code>finish()</Code> to route the input through the
        interactions registered during the render pass.
      </P>
      <CodeBlock lang="cpp">{`freeink::ui::InteractionBuffer<32> interactions;
freeink::ui::InputSnapshot input = readInput();
freeink::ui::GfxRendererTarget draw(renderer);   // FreeInkUIGfxRenderer.h
freeink::ui::DeviceContext device = draw.deviceContext();

freeink::ui::Frame<32> ui(draw, device, input, interactions);

freeink::ui::Stack<3> screen(ui.safeRect(), freeink::ui::Axis::Column, 0);
screen.fixed(statusBarHeight);
screen.flex(1);
screen.fixed(controlBarHeight);
screen.layout();

statusBar(ui, screen.rect(0), props);
pageRenderer.renderInto(screen.rect(1));         // app-drawn content slot
controlBar(ui, screen.rect(2), props);

if (auto event = ui.finish()) {
  handleAction(event.action, event.value);
}`}</CodeBlock>
      <P>
        The app owns persistent state — selected row, focused index, scroll offset, clock buffers,
        reading statistics, visibility flags. The UI runtime only adds transient focus/active state
        when it resolves styles.
      </P>

      <H2>Actions, not hardware</H2>
      <P>
        Interactive components register semantic actions and an <Code>inputMask</Code>. The same
        component can be selectable by touch, GPIO/focus, side buttons or gestures depending on the
        mask and the device's capabilities.
      </P>
      <CodeBlock lang="cpp">{`button(ui, rect, {
    .label = tr(STR_SELECT),
    .action = ActionSelect,
    .inputMask = freeink::ui::InputTouch |
                 freeink::ui::InputFocus |
                 freeink::ui::InputConfirm,
});`}</CodeBlock>

      <H2>Built-in components</H2>
      <P>
        A small set of immediate-mode components, deliberately not tied to any application's screen
        structure. Apps draw app-specific content (a book page, a cover image) directly into a slot
        rect the layout hands back.
      </P>
      <Table
        head={['Component', 'What it covers']}
        rows={[
          [<Code key="a">button</Code>, 'Themed, state-styled, any input source via inputMask.'],
          [<Code key="b">statusBar</Code>, 'Measured leading/trailing clusters + centered title with cluster-aware fallback; built-in progress bar; doubles as a top/bottom page overlay.'],
          [<Code key="c">tabBar</Code>, 'Pill or underline-style tabs with an optional divider.'],
          [<Code key="d">list</Code>, 'Virtualized rows; fill/outline/pill styles plus Underline/Triangle selection markers; hug-content pill rows; section headers.'],
          [<Code key="e">keyGrid / textField</Code>, 'Keyboard grids with KeyKind special keys and glyph art; chunk-measured cursor for long URLs/passphrases (masking stays app-side).'],
          [<Code key="f">optionDialog / popup</Code>, 'Panel + up to three text slots (small title caption, a prominent multi-line headline that reserves exactly the lines it wraps to, and a body message, each with its own style/maxLines) + an option-button row/column, optional dithered scrim.'],
          [<Code key="g">metricCard / progressBar</Code>, 'Statistics value/label cells and horizontal bar charts (minFill keeps tiny values visible).'],
          [<Code key="h">batteryIndicator</Code>, 'Battery glyph; triangle-built lightning bolt while charging, or an app-supplied icon.'],
          [<Code key="i">header / gestureBar</Code>, 'Section headers and button-hint bars.'],
          [<Code key="j">coverCarousel</Code>, 'Lays out a prev/center/next cover row (distinct center/side sizing, optional wrap at the edges) with selection chrome and tap/swipe/prev-next routing; returns slots[3] and the app renders cover art into each slot.content rect, so image decoding and frame caching stay app-owned.'],
        ]}
      />

      <H2>Virtualized lists</H2>
      <P>
        <Code>list</Code> never creates a node per item. The app owns the full item array plus scroll
        state; the component lays out, draws and registers interactions only for the rows that fully
        fit, and draws a right-edge scroll indicator when the list overflows.
      </P>
      <CodeBlock lang="cpp">{`const uint16_t visible = freeink::ui::listVisibleRows(rect, theme.rowHeight);
topIndex = freeink::ui::listTopIndexFor(selectedIndex, topIndex, visible, count);

freeink::ui::ListProps props;
props.items = items;
props.count = count;            // total items, not just visible ones
props.topIndex = topIndex;      // first row drawn at the top of the rect
props.selectedIndex = selectedIndex;
props.action = ActionOpenBook;
freeink::ui::list(ui, rect, props);`}</CodeBlock>
      <P>
        <Code>listTopIndexFor</Code> scrolls the window the minimal amount to keep the selection
        visible and clamps to range, so GPIO up/down navigation gets correct scrolling for free.
      </P>

      <H2>Styling and themes</H2>
      <P>
        Every interactive component resolves a <Code>StyleSet</Code> — one <Code>BoxStyle</Code>{' '}
        (background, foreground, border, radius, corner mask) per interaction state. Rounded looks are
        first-class: <Code>BoxStyle.radius</Code> applies to fills and borders, <Code>tabBar</Code>{' '}
        renders filled pill tabs, and <Code>ListProps.hugContents</Code> shrinks selection pills to the
        label width — no custom drawing code.
      </P>
      <P>
        Theme ownership is split deliberately: <strong>the SDK owns the in-memory types</strong>{' '}
        (<Code>ThemeTokens</Code>, <Code>ThemeDocument</Code>, <Code>StyleSet</Code>,{' '}
        <Code>AssetResolver</Code>); <strong>apps own JSON and storage parsing</strong>. FreeInkUI
        never reads files, parses JSON or allocates — a firmware parses its theme files (with whatever
        JSON library and caching it already has) into <Code>ThemeTokens</Code> plus its own extension
        structs, then renders from those. App-only features live under{' '}
        <Code>extensions.&lt;namespace&gt;</Code>, so multiple firmwares can share one theme file.
      </P>

      <H2>Dark mode</H2>
      <P>
        Whole-UI inversion is one call at the draw-target level rather than per component.{' '}
        <Code>InvertedDrawTarget</Code> wraps any <Code>DrawTarget</Code> and flips every color drawn
        through it — black↔white, light↔dark gray, dithers included — so component defaults, theme
        styles and app-drawn chrome all invert together.
      </P>
      <CodeBlock lang="cpp">{`freeink::ui::GfxRendererTarget real(renderer);
freeink::ui::InvertedDrawTarget target(real, settings.darkMode);
freeink::ui::Frame<32> ui(target, device, input, interactions);
// ... render exactly as in light mode ...`}</CodeBlock>
      <P>
        Flip <Code>target.setEnabled(...)</Code> from a setting and the next frame renders inverted;
        when disabled the wrapper is a pure passthrough. The screen clear stays app-owned (clear to
        black when inverted).
      </P>

      <H2>Rotation and scaling</H2>
      <P>
        Whole-screen rotation is inherited from the renderer: layout happens in logical coordinates,{' '}
        <Code>DeviceContext.orientation</Code> reports the active orientation, and the adapter maps to
        panel space. Per-element rotation (side-bezel button hints) rides on{' '}
        <Code>TextStyle.rotation</Code> for labels and the <Code>rotation</Code> parameter of{' '}
        <Code>DrawTarget::bitmap()</Code> for icons (<Code>CW90</Code>, <Code>R180</Code>,{' '}
        <Code>CCW90</Code>). Touch follows along: orientation mapping is SDK-owned, so{' '}
        <Code>touchToLogical()</Code> converts normalized panel-native portrait coordinates into the
        logical frame for any orientation (with <Code>flipX</Code> / <Code>flipY</Code> for mirrored
        panel mounting, a per-board property), and no app re-derives the transform by hand. Smaller
        displays scale through <strong>layout, not transforms</strong> —
        rects and flex splits adapt, themes override sizes per device, and font slots bind smaller font
        ids, since fractional glyph scaling produces mush on a 1-bit panel. Bitmaps do scale: every{' '}
        <Code>BitmapMode</Code> (Center, Stretch, Contain, Cover, Tile, TileX, TileY) runs through a
        shared nearest-neighbor sampler.
      </P>

      <H2>Adapters</H2>
      <P>
        FreeInkUI itself has no dependencies. Optional header-only adapters bridge it to common stacks
        and only compile in firmwares that include them.
      </P>
      <Table
        head={['Adapter', 'Bridges']}
        rows={[
          [
            <Code key="a">FreeInkUIGfxRenderer.h</Code>,
            <><Code>GfxRendererTarget</Code>, a <Code>DrawTarget</Code> over the <Code>GfxRenderer</Code> drawing library: dither-mapped colors, per-corner rounded rects, and text measurement/truncation/wrapping through the renderer's own pipeline. <Code>deviceContext()</Code> derives screen size and orientation.</>,
          ],
          [
            <Code key="b">FreeInkUIInputManager.h</Code>,
            <>Builds the per-frame <Code>InputSnapshot</Code> from the SDK's <A href="/docs/lib-input">InputManager</A> via <Code>snapshotFrom(inputManager)</Code>. <Code>ButtonBindings</Code> overrides the default UP/DOWN→focus, LEFT/RIGHT→prev/next, CONFIRM/BACK mapping per board. An orientation-aware <Code>snapshotFrom(input, device, flipX, flipY)</Code> overload returns taps already mapped to the logical frame.</>,
          ],
        ]}
      />
      <P>
        Writing your own <Code>DrawTarget</Code> is small: implement the drawing primitives over your
        renderer (fills with per-corner radius masks, <Code>line()</Code>, <Code>triangle()</Code>,{' '}
        <Code>text()</Code>, <Code>bitmap()</Code>). You do <strong>not</strong> have to write text
        layout — <Code>layoutText()</Code> is an SDK-owned algorithm (greedy word wrap, hard{' '}
        <Code>\n</Code> breaks, character breaking for over-wide words, ellipsis truncation, alignment
        and vertical centering) built only on your <Code>measureText</Code>, so a target's{' '}
        <Code>text()</Code> reduces to drawing the emitted single-line runs. Targets that already have a
        native bidi/kerning-aware wrapping pipeline (like the <Code>GfxRenderer</Code> adapter) keep
        using their own.
      </P>
      <P>
        So existing fonts, bidi, localization and page rendering stay where they are — FreeInkUI does
        not translate strings (apps pass already-localized, borrowed strings) and large image decoding
        stays app/renderer-owned.
      </P>

      <Callout title="Adopting it incrementally">
        <p>
          Port one screen of chrome first — a status bar + content slot + control bar split is a good
          proof of pipeline — then move shared surfaces screen-by-screen (headers, lists, button hints,
          popups, keyboards). Each port deletes the hand-rolled layout code it replaces. App-specific
          page rendering (book text layout, image decoding) stays app-owned: FreeInkUI hands the app a
          computed slot rect and the app renders into it. See the{' '}
          <A href="https://github.com/Free-Ink/freeink-sdk/blob/main/docs/freeink-ui.md">full FreeInkUI guide</A>.
        </p>
      </Callout>
    </>
  )
}
