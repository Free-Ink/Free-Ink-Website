// Generate /llms.txt and /llms-full.txt from the docs registry.
//
// The docs pages are JSX components, so (like index-docs.mjs) there's no source
// text to read directly: we bundle the registry with esbuild, render each page
// to HTML, and convert that HTML to Markdown. Two artifacts are written to
// public/ so they ship as static assets:
//
//   llms.txt       a concise, link-first index (the llmstxt.org convention):
//                  title + summary + every doc page grouped, with descriptions.
//   llms-full.txt  every page's full prose, concatenated, so an LLM can learn
//                  the SDK from one self-contained file without crawling.
//
// Run with `npm run gen-llms`. Re-run whenever the docs change (alongside
// `npm run index-docs`).

import { build } from 'esbuild'
import { parseHTML } from 'linkedom'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = 'https://freeink.org'
const TMP_DIR = join(process.cwd(), '.tmp-llms')

const SUMMARY =
  'FreeInk is an MIT-licensed, hardware-independent C++ SDK for ESP32-class e-paper readers. ' +
  'It hides e-paper controllers, waveforms and board wiring behind injectable interfaces, so one ' +
  'firmware can drive many panels. Libraries are self-contained PlatformIO dependencies you add à la ' +
  'carte; a single binary can carry several boards and pick one at runtime.'

// ---- Load + render the docs (same approach as index-docs.mjs) ---------------

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
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
    logLevel: 'error',
  })
  const mod = await import(`${outfile}?t=${Date.now()}`)
  return mod.DOC_PAGES
}

// ---- HTML -> Markdown -------------------------------------------------------

const resolveHref = (href) =>
  href && href.startsWith('/') && !href.startsWith('//') ? SITE + href : href || '#'

const collapse = (s) => s.replace(/[ \t]+/g, ' ').replace(/\s+\n/g, '\n')

// Serialize inline content (text, code, links, emphasis) of one element.
function inline(node) {
  let out = ''
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      out += child.textContent
      continue
    }
    if (child.nodeType !== 1) continue
    const tag = child.tagName
    if (tag === 'CODE') out += '`' + child.textContent.replace(/`/g, '') + '`'
    else if (tag === 'A') out += `[${inline(child)}](${resolveHref(child.getAttribute('href'))})`
    else if (tag === 'STRONG' || tag === 'B') out += `**${inline(child)}**`
    else if (tag === 'EM' || tag === 'I') out += `*${inline(child)}*`
    else if (tag === 'BR') out += '\n'
    else out += inline(child)
  }
  return out
}

const cell = (el) => collapse(inline(el)).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()

function table(tableEl) {
  const head = [...tableEl.querySelectorAll('thead th')].map(cell)
  const rows = [...tableEl.querySelectorAll('tbody tr')].map((tr) =>
    [...tr.querySelectorAll('td')].map(cell),
  )
  const lines = [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`]
  for (const r of rows) lines.push(`| ${r.join(' | ')} |`)
  return lines.join('\n')
}

function codeBlock(div) {
  const pre = div.querySelector('pre')
  const prev = pre.previousElementSibling
  const lang = prev && prev.tagName === 'DIV' ? prev.textContent.trim().toLowerCase() : ''
  return '```' + lang + '\n' + pre.textContent.replace(/\n+$/, '') + '\n```'
}

// Convert a rendered page (children of <main>) to Markdown.
function pageToMarkdown(page) {
  let html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(page.Content)))
  const { document } = parseHTML(`<main>${html}</main>`)
  document.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())
  const root = document.querySelector('main')

  const blocks = []
  for (const node of root.children) {
    const tag = node.tagName
    // Headings wrap their text in a self-anchor (<a href="#slug">); unwrap it.
    const heading = (n) => collapse(inline(n)).replace(/\[([^\]]+)\]\(#[^)]*\)/g, '$1').trim()
    if (tag === 'H2') blocks.push(`## ${heading(node)}`)
    else if (tag === 'H3') blocks.push(`### ${heading(node)}`)
    else if (tag === 'P') blocks.push(collapse(inline(node)).trim())
    else if (tag === 'UL')
      blocks.push([...node.children].map((li) => `- ${collapse(inline(li)).trim()}`).join('\n'))
    else if (tag === 'OL')
      blocks.push(
        [...node.children].map((li, i) => `${i + 1}. ${collapse(inline(li)).trim()}`).join('\n'),
      )
    else if (tag === 'DIV') {
      if (node.querySelector('pre')) blocks.push(codeBlock(node))
      else if (node.querySelector('table')) blocks.push(table(node.querySelector('table')))
      else {
        // Callout: a bold title paragraph plus a body.
        const titleEl = [...node.children].find((c) => c.tagName === 'P')
        const bodyEl = [...node.children].find((c) => c.tagName === 'DIV')
        const title = titleEl ? `**${collapse(inline(titleEl)).trim()}**` : ''
        const body = bodyEl ? collapse(inline(bodyEl)).trim() : collapse(inline(node)).trim()
        blocks.push([title, body].filter(Boolean).map((l) => `> ${l}`).join('\n>\n'))
      }
    }
  }
  return blocks.filter(Boolean).join('\n\n')
}

// ---- Emit the two files -----------------------------------------------------

function buildIndex(pages) {
  const groups = []
  for (const p of pages) {
    let g = groups.find((x) => x.title === p.group)
    if (!g) groups.push((g = { title: p.group, pages: [] }))
    g.pages.push(p)
  }
  const lines = [`# FreeInk SDK`, ``, `> ${SUMMARY}`, ``]
  lines.push(
    `Hardware-independent C++ firmware SDK for e-paper readers. Source: ` +
      `[github.com/Free-Ink/freeink-sdk](https://github.com/Free-Ink/freeink-sdk). ` +
      `The full text of every page below is also available as one file: ` +
      `[${SITE}/llms-full.txt](${SITE}/llms-full.txt).`,
    ``,
  )
  for (const g of groups) {
    lines.push(`## ${g.title}`, ``)
    for (const p of g.pages) {
      lines.push(`- [${p.title}](${SITE}/docs/${p.slug}): ${p.description}`)
    }
    lines.push(``)
  }
  return lines.join('\n').replace(/\n+$/, '\n')
}

function buildFull(pages) {
  const out = [
    `# FreeInk SDK — Full Documentation`,
    ``,
    `> ${SUMMARY}`,
    ``,
    `This file concatenates every documentation page from ${SITE}/docs for LLM consumption.`,
    ``,
  ]
  for (const p of pages) {
    out.push(
      `---`,
      ``,
      `# ${p.title}`,
      ``,
      `> ${p.description}`,
      ``,
      `Group: ${p.group} · URL: ${SITE}/docs/${p.slug}`,
      ``,
      pageToMarkdown(p),
      ``,
    )
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n')
}

async function main() {
  const pages = await loadDocPages()
  mkdirSync('public', { recursive: true })
  writeFileSync('public/llms.txt', buildIndex(pages))
  writeFileSync('public/llms-full.txt', buildFull(pages))
  rmSync(TMP_DIR, { recursive: true, force: true })
  console.log(`Wrote public/llms.txt and public/llms-full.txt (${pages.length} pages).`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
