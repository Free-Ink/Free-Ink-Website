// Build the Vectorize search index from the docs pages.
//
// The pages are JSX components, so there's no source text to read. We bundle the
// docs registry with esbuild (React kept external so the bundled components and
// this script share one React instance), render each page to HTML, split it into
// per-section chunks, embed every chunk with Workers AI over the REST API, and
// upsert the vectors into Vectorize.
//
// Auth: uses CLOUDFLARE_API_TOKEN if set, otherwise the local wrangler OAuth
// session. Run with `npm run index-docs`.

import { build } from 'esbuild'
import { parseHTML } from 'linkedom'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const INDEX_NAME = 'freeink-docs'
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5'
const SNIPPET_MAX = 600
const TMP_DIR = join(process.cwd(), '.tmp-index')

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()

// Short, stable id (Vectorize caps ids at 64 bytes). FNV-1a keeps a readable
// slug prefix while guaranteeing uniqueness + idempotent re-runs.
function vectorId(slug, anchor) {
  let h = 0x811c9dc5
  const key = `${slug}::${anchor}`
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  const hash = (h >>> 0).toString(16).padStart(8, '0')
  return `${slug.slice(0, 48)}-${hash}`
}

// ---- Cloudflare credentials -------------------------------------------------

function wranglerOAuthToken() {
  const candidates = [
    join(homedir(), 'Library', 'Preferences', '.wrangler', 'config', 'default.toml'),
    join(homedir(), '.config', '.wrangler', 'config', 'default.toml'),
    join(homedir(), '.wrangler', 'config', 'default.toml'),
  ]
  for (const path of candidates) {
    if (!existsSync(path)) continue
    const m = readFileSync(path, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)
    if (m) return m[1]
  }
  return null
}

function credentials() {
  const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || wranglerOAuthToken()
  if (!token) throw new Error('No Cloudflare token: set CLOUDFLARE_API_TOKEN or run `wrangler login`.')

  let accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!accountId) {
    // Pull the account id out of `wrangler whoami`.
    const out = execFileSync('npx', ['--no-install', 'wrangler', 'whoami'], { encoding: 'utf8' })
    accountId = out.match(/\b[0-9a-f]{32}\b/)?.[0]
  }
  if (!accountId) throw new Error('No account id: set CLOUDFLARE_ACCOUNT_ID.')
  return { token, accountId }
}

// ---- Extract chunks from the rendered docs ----------------------------------

async function loadDocPages() {
  mkdirSync(TMP_DIR, { recursive: true })
  const outfile = join(TMP_DIR, 'registry.mjs')
  await build({
    entryPoints: ['src/docs/registry.js'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    outfile,
    // Share React with this script so renderToStaticMarkup sees one instance.
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
    logLevel: 'error',
  })
  const mod = await import(`${outfile}?t=${Date.now()}`)
  return mod.DOC_PAGES
}

function chunksForPage(page) {
  const html = renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(page.Content)),
  )
  // Insert a separator just inside each block / table-cell close so adjacent
  // cells and list items don't run together in the extracted text (textContent
  // has no whitespace between sibling elements, and inter-element whitespace can
  // be dropped on parse — so the space goes *inside* the element).
  const spaced = html.replace(/(<\/(td|th|li|p|h2|h3|h4|dt|dd)>)/g, ' $1')
  const { document } = parseHTML(`<main>${spaced}</main>`)
  document.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())

  const root = document.querySelector('main')
  const chunks = []
  let cur = { heading: page.title, anchor: '', parts: [] }
  const flush = () => {
    const text = norm(cur.parts.join(' '))
    if (text) chunks.push({ heading: cur.heading, anchor: cur.anchor, text })
  }

  for (const node of root.children) {
    if (node.tagName === 'H2') {
      flush()
      cur = { heading: norm(node.textContent), anchor: node.id || '', parts: [] }
    } else {
      cur.parts.push(node.textContent)
    }
  }
  flush()

  // Always include the page's title + description as a chunk so a page surfaces
  // even when a section's body is sparse.
  const lead = norm(page.description)
  if (lead && !chunks.some((c) => c.anchor === '')) {
    chunks.unshift({ heading: page.title, anchor: '', text: lead })
  }

  return chunks.map((c) => ({
    id: vectorId(page.slug, c.anchor || 'intro'),
    slug: page.slug,
    title: page.title,
    group: page.group,
    heading: c.heading,
    anchor: c.anchor,
    text: c.text,
    // Text that actually gets embedded — page + section context improves recall.
    embedText: norm(`${page.group} — ${page.title} — ${c.heading}. ${c.text}`),
  }))
}

// ---- Embeddings -------------------------------------------------------------

async function embedBatch(texts, { token, accountId }) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBEDDING_MODEL}`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ text: texts }),
    },
  )
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(`AI embed failed (${res.status}): ${JSON.stringify(json.errors || json)}`)
  }
  return json.result.data
}

// ---- Main -------------------------------------------------------------------

async function main() {
  const creds = credentials()

  const pages = await loadDocPages()
  const chunks = pages.flatMap(chunksForPage)
  console.log(`Extracted ${chunks.length} chunks from ${pages.length} pages.`)

  // Embed in batches (the model accepts up to 100 inputs per call).
  const vectors = []
  for (let i = 0; i < chunks.length; i += 50) {
    const batch = chunks.slice(i, i + 50)
    const embeddings = await embedBatch(batch.map((c) => c.embedText), creds)
    batch.forEach((c, j) => {
      vectors.push({
        id: c.id,
        values: embeddings[j],
        metadata: {
          slug: c.slug,
          title: c.title,
          group: c.group,
          heading: c.heading,
          anchor: c.anchor,
          text: c.text.slice(0, SNIPPET_MAX),
        },
      })
    })
    console.log(`  embedded ${Math.min(i + 50, chunks.length)}/${chunks.length}`)
  }

  const ndjsonPath = join(TMP_DIR, 'vectors.ndjson')
  writeFileSync(ndjsonPath, vectors.map((v) => JSON.stringify(v)).join('\n') + '\n')

  console.log(`Upserting ${vectors.length} vectors into '${INDEX_NAME}'…`)
  execFileSync(
    'npx',
    ['--no-install', 'wrangler', 'vectorize', 'upsert', INDEX_NAME, '--file', ndjsonPath],
    { stdio: 'inherit' },
  )

  rmSync(TMP_DIR, { recursive: true, force: true })
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
