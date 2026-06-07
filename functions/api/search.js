// Cloudflare Pages Function: GET /api/search?q=…
//
// Semantic search over the docs. Embeds the query with Workers AI (the same
// bge-base-en-v1.5 model used to build the index) and looks up the nearest doc
// chunks in Vectorize. The index is populated out of band by
// scripts/index-docs.mjs. Bindings (AI, VECTORIZE) are configured in
// wrangler.toml / the Pages project settings.

// Must match the model + dimensions the Vectorize index was built with.
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim()
  const topK = Math.min(Number(url.searchParams.get('limit')) || 8, 20)

  if (!q) return Response.json({ results: [] })

  // Embed the query.
  let vector
  try {
    const embedding = await env.AI.run(EMBEDDING_MODEL, { text: [q] })
    vector = embedding.data?.[0]
  } catch (err) {
    return Response.json({ error: 'embedding_failed', detail: String(err) }, { status: 502 })
  }
  if (!vector) return Response.json({ error: 'no_embedding' }, { status: 502 })

  // Nearest-neighbour lookup.
  let matches
  try {
    const res = await env.VECTORIZE.query(vector, { topK, returnMetadata: 'all' })
    matches = res.matches || []
  } catch (err) {
    return Response.json({ error: 'vectorize_failed', detail: String(err) }, { status: 502 })
  }

  const results = matches.map((m) => ({
    slug: m.metadata?.slug,
    title: m.metadata?.title,
    group: m.metadata?.group,
    heading: m.metadata?.heading,
    anchor: m.metadata?.anchor || '',
    snippet: m.metadata?.text || '',
    score: m.score,
  }))

  return Response.json(
    { results },
    { headers: { 'cache-control': 'public, max-age=60' } },
  )
}
