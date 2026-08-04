import { Lead, P, H2, A, Code, CodeBlock, ApiTable, Callout } from '../../prose.jsx'

export default function MemoryManager() {
  return (
    <>
      <Lead>
        An on-demand RAM-reclaim helper: a small, priority-ordered registry of evictable{' '}
        <strong>cache sinks</strong> plus heap reporting, over the ESP-IDF heap-capabilities allocator.
        It lets a consumer free memory on demand — a control-center "clear caches" / "boost" action — or
        under pressure, without the SDK needing to know what any given app caches.
      </Lead>

      <P>
        Any component that holds a rebuildable RAM cache — rendered pages, decoded images, glyph atlases,
        parsed-document buffers, PSRAM pools — registers a <Code>CacheSink</Code> once. A sink is a name,
        a <strong>priority</strong> (lower is evicted first, so cheap-to-rebuild caches go low), and an{' '}
        <Code>evict(bytesRequested)</Code> callback that frees memory and returns the bytes it released
        (<Code>bytesRequested == 0</Code> means "free everything"). <Code>MemoryManager</Code> is a
        singleton, so sinks can register from anywhere and any code can trigger a reclaim.
      </P>

      <CodeBlock lang="cpp">{`#include <MemoryManager.h>
using freeink::MemoryManager;

// Register once (e.g. in each cache owner's begin()):
MemoryManager::instance().registerSink({"font.glyphs",  20, [&](size_t n){ return glyphs.evict(n); }});
MemoryManager::instance().registerSink({"render.pages", 40, [&](size_t n){ return pages.evict(n); }});
MemoryManager::instance().registerSink({"image.decode", 30, [&](size_t n){ return imgPool.evict(n); }});`}</CodeBlock>

      <H2>Reclaim</H2>
      <ApiTable
        rows={[
          ['registerSink(CacheSink) ', 'Register a rebuildable cache by name, priority (lower = evicted first) and an evict(n) callback. Re-registering a name replaces the existing sink. Up to kMaxSinks (12) sinks.'],
          ['clearCaches(size_t bytes) → size_t', 'Walk the sinks lowest-priority first, passing each the remaining shortfall and stopping once bytes are freed (bytes = 0 purges all). Returns the total freed.'],
          ['boost(&before, &after) → size_t', 'Purge everything and return the honest, heap-measured free delta — the number you show the user ("Freed 1.8 MB"). Momentary, touches no NVS.'],
        ]}
      />

      <H2>Reporting</H2>
      <P>
        For a "memory" read-out, or to gate work on available RAM. <Code>MemPool</Code> is{' '}
        <Code>Internal</Code> / <Code>Psram</Code> / <Code>Default</Code>.
      </P>
      <ApiTable
        rows={[
          ['freeBytes(MemPool) → size_t', 'Free bytes in the pool (Psram returns 0 without PSRAM).'],
          ['largestFreeBlock(MemPool) → size_t', 'Biggest contiguous free block — what a single allocation can actually claim.'],
          ['minEverFree(MemPool) → size_t', 'The min-ever-free low-water mark since boot.'],
        ]}
      />

      <CodeBlock lang="cpp">{`// "Boost": purge everything and get the heap-measured free delta:
size_t before = 0, after = 0;
size_t freed = MemoryManager::instance().boost(&before, &after);

// Or free just enough to satisfy a target, lowest-priority caches first:
MemoryManager::instance().clearCaches(256 * 1024);   // free ~256 KB; 0 = purge all`}</CodeBlock>

      <Callout title="It measures, it doesn't estimate">
        <p>
          <Code>boost()</Code> wraps <Code>clearCaches()</Code> with a before/after heap measurement, so
          the number you display is what the allocator actually reclaimed, not what the sinks estimated.
          It is a purely momentary RAM operation and touches no NVS. Logs under <Code>[MEM]</Code> with{' '}
          <Code>-DENABLE_SERIAL_LOG</Code>.
        </p>
      </Callout>

      <P>
        The pattern mirrors the cache-sink manager e-reader firmware typically hand-rolls: a set of
        rebuildable caches asked to shrink, measured against free heap. Pair it with{' '}
        <A href="/docs/lib-book">FreeInkBook</A>'s page cache and image pools as the registered sinks.
      </P>
    </>
  )
}
