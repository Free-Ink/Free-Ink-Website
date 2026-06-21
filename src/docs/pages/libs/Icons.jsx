import { Lead, P, H2, A, Code, CodeBlock } from '../../prose.jsx'

export default function Icons() {
  return (
    <>
      <Lead>
        A 1-bpp icon format with baked-in alignment metadata, the full{' '}
        <A href="https://lucide.dev">Lucide</A> SVG set vendored as source, and a generator that turns
        any of them into ready-to-draw C structs — crisp at any UI scale, vertically centered on text
        with no per-icon tweaking, correct in every orientation.
      </Lead>

      <H2>The freeink::Icon format</H2>
      <CodeBlock lang="cpp">{`struct Icon {
  uint16_t w, h;
  int16_t  opticalCenterY;  // row of the artwork's center of mass
  const uint8_t* bits;      // rows top-to-bottom, (w+7)/8 bytes each, MSB-first;
                            // bit 1 = transparent, bit 0 = black (drawn)
};`}</CodeBlock>
      <P>
        <strong>Not pre-rotated.</strong> The renderer maps logical → panel coordinates itself, so one
        asset is correct in all four orientations — draw it through an orientation-aware blit (e.g.
        CrossPoint's <Code>GfxRenderer::drawIcon(const freeink::Icon&, x, y)</Code>, which routes each
        pixel through <Code>drawPixel</Code>).
      </P>
      <P>
        <strong><Code>opticalCenterY</Code> is measured from the art</strong>, so asymmetric icons (a
        clock, a wifi fan, arrows) center on a line of text without hand-nudging — put the icon's
        optical center on the text's optical center:
      </P>
      <CodeBlock lang="cpp">{`// textTop is where the text is drawn; the renderer supplies the text's optical
// center offset from the font's real x-height (no guessed ascender fractions).
const int textCenter = textTop + renderer.getTextVisualCenterOffset(fontId);
renderer.drawIcon(icon, x, textCenter - icon.opticalCenterY);`}</CodeBlock>

      <H2>Generating icons</H2>
      <P>
        Don't bake the whole library into flash — generate only what you use. List the icons you want in
        a manifest (<Code>alias = lucide-name</Code>) and run the generator:
      </P>
      <CodeBlock>{`# icons.txt
settings = settings
recent   = clock
transfer = arrow-down-up
wifi     = wifi

python libs/assets/Icons/tools/gen_icons.py \\
    --manifest icons.txt \\
    --svgdir   libs/assets/Icons/lucide/icons \\
    --sizes    24,32,40,48 \\
    --out      generated_icons.h`}</CodeBlock>
      <P>
        This emits, per icon per size, a{' '}
        <Code>static const freeink::Icon icon_&lt;alias&gt;_&lt;px&gt;</Code> with its bits and optical
        center precomputed. Pick the size nearest your scaled target at runtime so a scaled-up UI gets a
        genuinely higher-resolution asset instead of a blocky upscale. The generator needs{' '}
        <Code>rsvg-convert</Code> (librsvg) and Pillow.
      </P>

      <H2>Browsing the set</H2>
      <P>
        Lucide is vendored as a <strong>git submodule</strong> at{' '}
        <Code>libs/assets/Icons/lucide</Code> (run <Code>git submodule update --init</Code> to fetch
        it). All 1735 names live in <Code>libs/assets/Icons/lucide/icons/*.svg</Code> — reference any by
        filename (minus <Code>.svg</Code>) in a manifest. Lucide is MIT-licensed.
      </P>

      <H2>In FreeInkUI</H2>
      <P>
        <A href="/docs/lib-ui">FreeInkUI</A> components take icons as borrowed asset references and draw
        them through the draw target's <Code>bitmap()</Code> primitive, which carries the same{' '}
        <Code>CW90</Code> / <Code>R180</Code> / <Code>CCW90</Code> rotation parameter as the rest of the
        UI — so icons rotate with side-bezel chrome and follow whole-screen orientation for free.
      </P>
    </>
  )
}
