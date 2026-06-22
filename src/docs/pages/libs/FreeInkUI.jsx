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
        unit tests (<Code>libs/ui/FreeInkUI/test/host/run.sh</Code>). It now ships a{' '}
        <strong>built-in renderer</strong> (<Code>DisplayTarget</Code>) and a bundled font, so it draws
        a complete UI into a FreeInkDisplay framebuffer with no external graphics library; bridging to an
        app's own drawing stack is optional.
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

// Built-in renderer: draws straight into FreeInkDisplay's framebuffer, no deps.
freeink::ui::DisplayTarget draw(display.getFrameBuffer(), display.getDisplayWidth(),
                                display.getDisplayHeight(), display.getDisplayWidthBytes());
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

      <H2>Rendering</H2>
      <P>
        The built-in <Code>DisplayTarget</Code> (<Code>FreeInkUIDisplayTarget.h</Code>) is a
        self-contained <Code>DrawTarget</Code> that writes directly into a 1-bpp framebuffer — the same
        layout <Code>FreeInkDisplay::getFrameBuffer()</Code> hands back — with <strong>no external
        graphics library</strong>, so the exact same render runs in firmware and in host unit tests. It
        bundles a <strong>Noto Sans bitmap font</strong> across eight font slots; point a slot (or all of
        them) at your own <Code>BitmapFont</Code> with <Code>setFont()</Code>, generated from any TTF/OTF
        by <Code>tools/gen_font.py</Code>. On a 1-bit panel the four UI grays
        (<Code>Black</Code> / <Code>DarkGray</Code> / <Code>LightGray</Code> / <Code>White</Code>) are
        reproduced with an ordered Bayer dither.
      </P>
      <P>
        Bridging to an app's own drawing stack is optional: the header-only{' '}
        <Code>GfxRendererTarget</Code> adapter (below) compiles only where a CrossPoint{' '}
        <Code>GfxRenderer</Code> is on the include path, for firmwares that already own a text/bidi
        pipeline. New apps just use <Code>DisplayTarget</Code>.
      </P>

      <H2>FreeInkApp — screen builder</H2>
      <P>
        The core flow above is the raw immediate-mode loop. Most firmware starts a level up, with{' '}
        <Code>FreeInkApp</Code> (<Code>FreeInkApp.h</Code>) — an ergonomic, still allocation-free wrapper
        that owns the interaction buffer, dispatches semantic actions to callbacks, and gives each screen
        a top-to-bottom <Code>Screen</Code> builder (<Code>header()</Code>, <Code>status()</Code>,{' '}
        <Code>button()</Code>, <Code>list()</Code>, <Code>footer()</Code>, plus{' '}
        <Code>takeTop()</Code> / <Code>takeBottom()</Code> / <Code>spacer()</Code> / <Code>body()</Code>{' '}
        for custom bands). Each <Code>render()</Code> re-runs your screen function and returns an{' '}
        <Code>ActionEvent</Code>; it also records a <Code>RefreshHint</Code>{' '}
        (<Code>None</Code> / <Code>Fast</Code> / <Code>Full</Code> / <Code>Clean</Code>) so firmware
        picks the e-paper refresh mode — the app never pushes pixels itself. Because it's freestanding,
        a design-time tool can emit ordinary C++ against the same API.
      </P>
      <CodeBlock lang="cpp">{`using App = freeink::ui::FreeInkApp<32, 16>;

void homeScreen(App::ScreenType& screen, void* user) {
  auto& state = *static_cast<AppState*>(user);
  screen.header("Library");
  const freeink::ui::FooterAction footer[] = {
      {.label = "Open", .action = ActionOpen},
      {.label = "Back", .action = ActionBack},
  };
  screen.footer(footer, 2);
  screen.list(state.books, 2, state.selected, ActionOpen);
}

App app(target, target.deviceContext());     // target = a DisplayTarget
app.setScreen(homeScreen, &state);
app.on(ActionOpen, handleOpen, &state);

// each loop:
freeink::ui::ActionEvent event = app.render(readInputSnapshot());
if (app.lastRenderRefreshHint() != freeink::ui::RefreshHint::None) {
  display.displayBuffer(/* map the hint to FULL / FAST */);
}`}</CodeBlock>

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
      <P>
        Touch hit areas are declarative and decoupled from the visual rect, composed in one place
        (<Code>ensureMinTouchRect</Code>): <Code>minTouchSize</Code> center-expands a small target to a
        comfortable minimum, <Code>ButtonProps.hitPadding</Code> extends a button's tap band per edge so
        adjacent controls (a stepper's <Code>−</Code> / <Code>+</Code>) get contiguous, non-overlapping
        bands instead of overlapping centered expansion, and any hit rect within ~12 px of a screen edge
        snaps to the bezel — eliminating the dead zone between an edge control and the physical border
        (Fitts's law). The visual rect is unchanged by all three.
      </P>
      <P>
        <strong>Swipes route the same way.</strong> The app detects a flick with{' '}
        <A href="/docs/lib-input">InputManager</A>'s <Code>wasSwipe()</Code>, picks the dominant axis,
        sets <Code>InputSnapshot.swipeLeft</Code> / <Code>swipeRight</Code>, and components that opt in
        with the <Code>InputSwipeLeft</Code> / <Code>InputSwipeRight</Code> mask bits fire their action
        — so a list can be paged by swipe and by GPIO with one declaration.
      </P>

      <H2>Built-in components</H2>
      <P>
        A set of immediate-mode components, deliberately not tied to any application's screen structure.
        Apps draw app-specific content (a book page, a cover image) directly into a slot rect the layout
        hands back. Every one is previewed from its real 1-bit render in the{' '}
        <A href="/docs/lib-ui-components">component gallery</A>.
      </P>
      <Table
        head={['Component', 'What it covers']}
        rows={[
          [<Code key="a">button</Code>, 'Themed, state-styled, any input source via inputMask.'],
          [<Code key="set">settingRow / toggleRow / stepperRow / radioGroup</Code>, 'Settings-screen rows: label + value, an on/off switch, a −/+ stepper (drawn as centered strokes), and a single-choice group.'],
          [<Code key="b">statusBar</Code>, 'Measured leading/trailing clusters + centered title with cluster-aware fallback; built-in progress bar; doubles as a top/bottom page overlay.'],
          [<Code key="c">tabBar</Code>, 'Pill or underline-style tabs with an optional divider.'],
          [<Code key="d">list</Code>, 'Virtualized rows; fill/outline/pill styles plus Underline/Triangle selection markers; hug-content pill rows; section headers.'],
          [<Code key="e">keyGrid / qwertyKeyboard / textField</Code>, 'A KeyKind key grid with glyph art, a full four-row QWERTY keyboard (Shift, mode, space, delete), and a single-line field with a chunk-measured cursor for long URLs/passphrases (masking stays app-side).'],
          [<Code key="rd">readerChrome / tapZones</Code>, 'Reader surfaces: top/bottom reading chrome (title + progress label/bar) and page tap zones (prev / menu / next) with swipe routing.'],
          [<Code key="lib">bookCard / coverGrid</Code>, 'Library surfaces: a cover + title/author/meta + progress row, and a cover-art grid for visual selection.'],
          [<Code key="f">optionDialog / popup / messagePanel / toast / contextMenu</Code>, 'Overlays: a titled option dialog (caption + multi-line headline + body), a bare popup panel with an optional dithered scrim, an empty/error/loading message panel with retry, a static e-paper-safe toast, and a long-press command menu.'],
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
      <P>
        A set of selection helpers own the index math so apps don't re-derive it per input source, each
        returning whether the index changed (so the app only redraws on a real move):{' '}
        <Code>listClampedIndex(index, count)</Code> clamps to range;{' '}
        <Code>listSelectIndex(sel, requested, count)</Code> jumps to a row (a tap or gesture);{' '}
        <Code>listMoveIndex(sel, delta, count)</Code> steps with wraparound (GPIO up/down);{' '}
        <Code>listPageIndex(sel, deltaPages, count, pageItems)</Code> moves by a screenful without
        wrapping.
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
      <CodeBlock lang="cpp">{`freeink::ui::DisplayTarget real(display.getFrameBuffer(), display.getDisplayWidth(),
                               display.getDisplayHeight(), display.getDisplayWidthBytes());
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
        ids, since fractional glyph scaling produces mush on a 1-bit panel. The board profile carries a{' '}
        <Code>uiScale</Code> multiplier (<A href="/docs/lib-board">BoardConfig</A>) the app folds into its
        theme metrics and minimum touch sizes — a big finger-driven touch panel like the Sticky bumps
        chrome and fonts up, a button-driven e-ink reader leaves it at 1.0. Bitmaps do scale: every{' '}
        <Code>BitmapMode</Code> (Center, Stretch, Contain, Cover, Tile, TileX, TileY) runs through a
        shared nearest-neighbor sampler, and <A href="/docs/lib-icons">icons</A> ship per size so a
        scaled-up UI gets a genuinely higher-resolution asset rather than a blocky upscale.
      </P>

      <H2>Adapters</H2>
      <P>
        FreeInkUI itself has no dependencies, and the built-in <Code>DisplayTarget</Code> renderer
        (above) needs no bridge at all. These optional header-only adapters wire it to an app's existing
        stacks instead, and only compile in firmwares that include them.
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
