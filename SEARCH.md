# Docs semantic search

The docs (`/docs/*`) have semantic search powered by Cloudflare **Workers AI**
(embeddings) + **Vectorize** (vector DB), served by a **Pages Function**.

## How it works

```
build time   scripts/index-docs.mjs   (npm run index-docs)
             ├─ bundle src/docs/registry.js (esbuild, React external)
             ├─ render each page → HTML → chunk by <h2> section
             ├─ embed each chunk  (Workers AI: @cf/baai/bge-base-en-v1.5, 768-d)
             └─ upsert vectors    (Vectorize index: freeink-docs)

runtime      functions/api/search.js  ──  GET /api/search?q=…
             ├─ embed the query   (same model)
             ├─ VECTORIZE.query(topK=8, returnMetadata:'all')
             └─ JSON { results:[{slug,title,group,heading,anchor,snippet,score}] }

frontend     src/docs/SearchDialog.jsx  (⌘K palette)
             └─ debounced fetch to /api/search, keyboard nav, term highlight
```

The site deploys to **Cloudflare Pages** on push. `npm run build` emits the SPA
to `dist/`; Pages serves that plus the `functions/` directory. `public/_redirects`
provides SPA fallback for client routes (Pages Functions are matched first, so
`/api/*` is unaffected).

## Bindings

Configured in `wrangler.toml` (read by Pages on git-connected builds):

- `AI` — Workers AI, for embeddings.
- `VECTORIZE` → index `freeink-docs` (768-dim, cosine).

> If your Pages project predates `wrangler.toml` binding support, add the same
> two bindings once under **Pages → Settings → Functions → Bindings** (an
> **AI** binding named `AI`, and a **Vectorize** binding named `VECTORIZE`
> pointing at `freeink-docs`).

## Re-indexing

**Run this whenever docs content changes** — the index is not rebuilt on deploy:

```sh
npm run index-docs
```

Auth uses `CLOUDFLARE_API_TOKEN` if set, otherwise your local `wrangler login`
session. Account id comes from `CLOUDFLARE_ACCOUNT_ID` or `wrangler whoami`.
Upserts are idempotent (vector ids are stable per `slug` + section anchor), so
re-running refreshes changed sections and adds new ones.

> Stale-section note: `index-docs` upserts current sections but does not delete
> vectors for sections/pages that were removed or renamed. After deleting or
> renaming pages/headings, recreate the index for a clean slate:
> `wrangler vectorize delete freeink-docs && wrangler vectorize create freeink-docs --dimensions=768 --metric=cosine && npm run index-docs`.

## The index (one-time, already done)

```sh
wrangler vectorize create freeink-docs --dimensions=768 --metric=cosine
```

## Local dev

```sh
npm run build && npm run pages:dev     # wrangler pages dev dist
```

`wrangler pages dev` runs the Function with `/api/search` live. Vectorize/AI have
no local simulator, so it proxies to the real bindings on your account.
