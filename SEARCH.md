# Docs semantic search

The docs (`/docs/*`) have semantic search powered by Cloudflare **Workers AI**
(embeddings) + **Vectorize** (vector DB), served from the site's Worker.

## How it works

```
build time   scripts/index-docs.mjs
             ├─ bundle src/docs/registry.js (esbuild, React external)
             ├─ render each page → HTML → chunk by <h2> section
             ├─ embed each chunk  (Workers AI: @cf/baai/bge-base-en-v1.5, 768-d)
             └─ upsert vectors    (Vectorize index: freeink-docs)

runtime      worker/index.js  ──  GET /api/search?q=…
             ├─ embed the query   (same model)
             ├─ VECTORIZE.query(topK=8, returnMetadata:'all')
             └─ JSON { results:[{slug,title,group,heading,anchor,snippet,score}] }

frontend     src/docs/SearchDialog.jsx  (⌘K palette)
             └─ debounced fetch to /api/search, keyboard nav, term highlight
```

## Bindings (`wrangler.jsonc`)

- `ASSETS` — the built SPA (static assets).
- `AI` — Workers AI, for embeddings.
- `VECTORIZE` → index `freeink-docs` (768-dim, cosine). `"remote": true` lets
  `vite dev` reach the real index (Vectorize has no local simulator).

## Re-indexing

**Run this whenever docs content changes** — the index is not rebuilt on deploy:

```sh
npm run index-docs
```

Auth uses `CLOUDFLARE_API_TOKEN` if set, otherwise your local `wrangler login`
session. Account id comes from `CLOUDFLARE_ACCOUNT_ID` or `wrangler whoami`.
Upserts are idempotent (vector ids are stable per `slug` + section anchor), so
re-running is safe; it refreshes changed sections and adds new ones.

> Stale-section note: `index-docs` upserts current sections but does not delete
> vectors for sections/pages that were removed or renamed. After deleting or
> renaming pages/headings, recreate the index for a clean slate:
> `wrangler vectorize delete freeink-docs && wrangler vectorize create freeink-docs --dimensions=768 --metric=cosine && npm run index-docs`.

## Local dev

`npm run dev` runs the Worker (via `@cloudflare/vite-plugin`) with `/api/search`
live against the remote AI + Vectorize bindings.
