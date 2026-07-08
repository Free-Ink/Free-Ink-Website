import { Lead, P, H2, A, Ul, Li, Code, CodeBlock, Table, Callout } from '../../prose.jsx'

export default function FreeInkBook() {
  return (
    <>
      <Lead>
        A complete <strong>EPUB reading engine</strong> (<Code>libs/book/FreeInkBook</Code>): it turns an
        EPUB on external storage into typeset, cached, tappable pages on an e-paper panel — container
        parsing, CSS, layout, pagination, fonts, images and links. Freestanding C++17 with no Arduino or
        ESP-IDF dependency; every byte of working memory is caller-supplied, and the whole pipeline runs
        (and is regression-tested) on a desktop host.
      </Lead>

      <H2>The four rules</H2>
      <P>Everything follows from four rules, each enforced by host tests rather than convention:</P>
      <Ul>
        <Li>
          <strong>Never a DOM.</strong> Chapters parse as a stream of SAX events feeding a layout state
          machine, so RAM is O(paragraph + page) — layout peak memory is byte-identical between a 1 KB
          chapter and a 19,000-page omnibus.
        </Li>
        <Li>
          <strong>Arenas only.</strong> All memory comes from caller-sized bump allocators that reset
          wholesale at book/chapter/page boundaries. No <Code>free()</Code>, so no fragmentation;
          exhaustion returns a status, never aborts.
        </Li>
        <Li>
          <strong>Layout once, render many.</strong> Pagination runs once per (book, settings) generation
          and serializes compact page records. A page turn is one small read + a glyph blit — no ZIP, no
          XML, no layout, ~2 KB of scratch.
        </Li>
        <Li>
          <strong>Host-testable end to end.</strong> Test binaries cover container, layout, cache and
          fonts — including CI-asserted memory ceilings and O(1) proofs.
        </Li>
      </Ul>

      <H2>Pipeline</H2>
      <Table
        head={['Stage', 'What it does']}
        rows={[
          ['Container', 'ZIP catalog + streaming inflate; OPF metadata / manifest / spine; nav + NCX TOC; encryption.xml parsing that tells font obfuscation from real DRM (obfuscated-font-only books still render; only true DRM → Encrypted).'],
          ['CSS', 'A tolerant subset cascade: element / .class selectors, ~15 properties, inline style="", chapter <style> blocks.'],
          ['Layout', 'SAX → block flow → UAX #14 line breaking → two-phase paragraph placement → page records. The same engine lays out .txt via layoutPlainText().'],
          ['Cache', 'FIBP page records: generation hash, torn-write detection, char anchors, id-anchor table, per-chapter totals.'],
          ['Fonts', 'A RenderFont interface; an stb_truetype engine (kerning, ligatures, AA); a style-aware FontChain.'],
          ['Render', 'Page → framebuffer compositor (mono dithered / sharp / Gray8, 4 rotations); streaming image decode with box-filter + Floyd–Steinberg.'],
        ]}
      />

      <P>
        The engine vendors its dependencies (UAX #14 line breaking, stb_truetype, expat XML);{' '}
        <Code>vendorVersions()</Code> reports the bundled versions, and the expat parser is exposed
        (<Code>epub/Expat.h</Code>) for apps that need XML of their own.
      </P>

      <H2>Quick start</H2>
      <P>
        The caller supplies storage adapters and arenas; the engine never touches a filesystem directly.
        Layout runs once into a cache, then pages read back forever:
      </P>
      <CodeBlock lang="cpp">{`using namespace freeink::book;

MyBookSource   source;   // BookSource:   readAt() / size() over the .epub
MyCacheStorage cache;    // CacheStorage: read + streaming-write of cache files

Arena bookArena(bookBuf, 512 * 1024);   // retained while the book is open
Arena scratch(scratchBuf, 512 * 1024);  // transient; released per call

Book book;
book.open(source, bookArena, scratch);   // ZIP catalog, OPF, TOC

TtfFont serif;  serif.init(ttfBytes, ttfLen, glyphArena);
FontChain fonts; fonts.add(&serif);      // + bold/italic/CJK faces…

LayoutParams params;                     // every reader setting in one struct
params.pageWidth = 480;  params.pageHeight = 800;
params.baseSizePx = 18;  params.font = &fonts;
params.defaultAlign = TextAlign::Justify;

// Paginate into the cache once per generation, then render any page.
Page page{};
reader.readPage(pageIndex, scratch, &page);
FrameTarget frame{fb, panelW, panelH, panelWBytes,
                  FrameFormat::Mono1Dithered, FrameRotation::Portrait};
PageRenderer::render(page, fonts, source, book.zip(), scratch, frame);`}</CodeBlock>

      <H2>Typography</H2>
      <P>
        The engine is script-aware, not just Latin. Line breaking is full Unicode <strong>UAX #14</strong>{' '}
        (correct break opportunities for every script, including CJK); justification distributes spare
        space across word gaps (Latin), inter-character gaps (spaceless CJK) or a mix, ending exactly at
        the margin without ever tearing words apart.
      </P>
      <Ul>
        <Li>
          <strong>CJK:</strong> kinsoku via <Code>language = "ja"</Code> / <Code>"ja-strict"</Code>,
          Korean word-break via <Code>"ko-keep-all"</Code>, JLREQ full-width-punctuation compression, and
          the quarter-em CJK↔Latin gap (Japanese/Chinese; Korean attaches particles like "TV를" directly).
        </Li>
        <Li>
          <strong>Bidi / RTL</strong> (UAX #9): Hebrew and Arabic — including embedded Latin words and
          numbers — are classified, level-ordered and bracket-mirrored, with glyphs stored in visual
          order so the renderer stays script-agnostic. RTL paragraphs mirror alignment and skip indent.
        </Li>
        <Li>
          <strong>Arabic shaping:</strong> contextual joining forms (isolated / initial / medial / final,
          lam-alef fused) baked in as Presentation Forms (needs a face covering U+FB50–FEFF; guarded per
          glyph by <Code>BookFont::covers()</Code>).
        </Li>
        <Li>
          <strong>Hyphenation:</strong> Liang/TeX patterns compiled by <Code>tools/hyphc.py</Code>{' '}
          (US English ships pre-generated); UTF-8 aware, with zero-width soft hyphens.
        </Li>
        <Li>
          <strong>Styles:</strong> per-run sizes (headings, <Code>small</Code>, real sub/sup baseline
          shifts), bold/italic via real or synthetic faces, underline, kerning-aware measurement, and{' '}
          <strong>ligatures</strong> (fi fl ff… baked into page records, so rendering needs no shaping).
        </Li>
        <Li>
          <strong>Focus reading</strong> (<Code>LayoutParams.focusReading</Code>): bolds each word's first
          ~45% as a fixation aid — resolved into ordinary bold runs at layout time.
        </Li>
      </Ul>

      <H2>Position, links, progress</H2>
      <P>
        Every page record carries <Code>charStart</Code> — the codepoint offset of its first run within
        the chapter — and because that offset is independent of every layout parameter, it's the
        universal locator. <strong>Bookmarks</strong> are <Code>(spineIndex, charStart)</Code> pairs, so
        changing font/size/margins relayouts and lands on the same sentence. <strong>Links</strong>:{' '}
        <Code>{'<a href>'}</Code> regions become tappable <Code>PageLink</Code> rects and <Code>id</Code>{' '}
        anchors resolve a tapped footnote exactly. <strong>Reading percentage</strong> comes from each
        chapter's stored total character count.
      </P>

      <H2>Fonts</H2>
      <P>
        <Code>RenderFont</Code> is the one interface (metrics + <Code>rasterize()</Code> +{' '}
        <Code>hasGlyph()</Code> + <Code>ligature()</Code>). <Code>TtfFont</Code> wraps stb_truetype over a
        borrowed pointer — SD-loaded into PSRAM, memory-mapped from a flash partition, or compiled in —
        with real kern/GPOS kerning and an arena-bounded glyph cache, so even PSRAM-less MCUs serve TTFs
        from mapped flash. <Code>FontChain</Code> registers up to 8 style-flagged faces with per-codepoint
        fallback, so mixed scripts never render tofu.
      </P>
      <P>
        Two opt-in <A href="/docs/lib-ui">FreeInkUI</A> bridges live in{' '}
        <Code>FreeInkUIBookFont.h</Code>: <Code>BitmapBookFont</Code> reads books with the bundled bitmap
        font (zero font files required), and <Code>TtfGlyphSource</Code> feeds UI chrome its missing-glyph
        fallback (Hangul / CJK titles) from a <Code>TtfFont</Code>.
      </P>

      <H2>Images</H2>
      <P>
        <Code>{'<img>'}</Code> targets are probed for dimensions at layout time (header-only, no decode),
        placed aspect-fit and centered. At render time the decode <strong>streams</strong> — PNG
        scanline-by-scanline, JPEG in MCU bands — through box-filter resampling into Floyd–Steinberg
        dithering (1-bit) or raw grayscale (Gray8), so the full image never exists in memory. Progressive
        JPEGs (common for covers) take a <strong>DC-only first-scan path</strong>, rendering a 1/8-scale
        preview instead of a blank. Truly unsupported formats (GIF, SVG, interlaced PNG) leave their
        reserved space blank rather than failing the page.
      </P>

      <H2>Memory profiles</H2>
      <P>
        One build flag (<Code>BookProfile.h</Code>) tiers every fixed working set to the target's RAM
        class; CI builds and runs the layout suite under all three. Runtime choices (TTF vs bitmap fonts,
        Gray8 vs 1-bit, arena budgets) are orthogonal — the profile only sets the compile-time ceilings.
      </P>
      <Table
        head={['Profile', 'Flag', 'Fixture peak', 'For']}
        rows={[
          ['Small', <Code key="s">-DFREEINK_BOOK_SMALL=1</Code>, '~106 KB', 'PSRAM-less MCUs (ESP32-C3)'],
          ['Standard', <em key="d">(default)</em>, '~152 KB', 'PSRAM parts (ESP32-S3)'],
          ['Large', <Code key="l">-DFREEINK_BOOK_LARGE=1</Code>, '~231 KB', 'Big PSRAM budgets, host tools'],
        ]}
      />
      <P>
        Book arenas: 64 KB covers normal books (corpus high-water 5–40 KB); a 1,800-entry webnovel
        omnibus needs ~450 KB. Cache files are versioned (<Code>FIBP</Code> v3) and keyed by{' '}
        <Code>layoutGenerationHash()</Code> — every layout-relevant input plus the caller's font
        fingerprint — so a wrong hash means <Code>Stale</Code> → rebuild, and torn writes are caught by a
        footer magic.
      </P>
      <P>
        Two extras keep huge or slow books usable. A container too big to hold in RAM (a 1,700-spine
        omnibus) can use an <strong>SD-backed catalog</strong> (<Code>BookCatalog</Code>) that keeps only
        fixed FNV-1a hash tables resident — ~44 KB instead of ~400 KB — trading a one-time index build
        for the savings; the cache index itself grows on demand in 128-entry chunks, so a 10–30 page
        chapter uses ~1 KB rather than reserving the full 8 KB. And layout is <strong>incremental</strong>:{' '}
        <Code>readBackAt()</Code> serves already-written pages while pagination continues, and{' '}
        <Code>suspend()</Code> checkpoints a partial build so reopening a book shows pages instantly while
        a background pass finishes the rest (up to 4,096 pages per spine).
      </P>

      <Callout title="Proven on a real corpus">
        <p>
          Beyond the host suites, <Code>tools/fibcheck.cpp</Code> runs any real EPUB through the whole
          pipeline. The current corpus is ~50 commercial and pathological books across Latin, Cyrillic and
          CJK — including Ulysses, a 3,742-page omnibus and 1,700-chapter webnovels — all clean, with DRM'd
          books correctly rejected as <Code>Encrypted</Code>.
        </p>
      </Callout>
    </>
  )
}
