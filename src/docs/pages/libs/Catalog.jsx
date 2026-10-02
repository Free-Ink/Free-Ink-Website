import { Lead, P, H2, A, Code, ApiTable, Callout } from '../../prose.jsx'

export default function Catalog() {
  return (
    <>
      <Lead>
        An <strong>OPDS</strong> catalog client plus generic WebDAV/JSON list parsers, so a reader can
        browse and download books from a catalog server. Three opt-in libraries under{' '}
        <Code>libs/network/</Code> — <Code>Opds</Code>, <Code>CatalogList</Code> and{' '}
        <Code>JsonSax</Code> — layered on <A href="/docs/networking">SecureNet</A> for transport. Nothing
        buffers a whole feed: every parser streams rows out as the bytes arrive.
      </Lead>

      <H2>OpdsClient</H2>
      <P>
        The app-facing entry point. Point it at a server, hand it a feed URL, and it fetches over
        SecureNet and streams the response into a parser.
      </P>
      <ApiTable
        rows={[
          ['setServer(url, username, password)', 'Base catalog URL + HTTP Basic credentials.'],
          ['setTokens(access, refresh, refreshUrl)', 'Bearer/refresh tokens for token-auth servers (auto-refreshed on 401).'],
          ['setAcceptLanguage(lang)', 'Language-negotiation header.'],
          ['fetchFeed(url, OpdsFeedParser&) → FetchStatus', 'Fetch a catalog feed and stream it into the parser.'],
          ['fetchPublication(docUrl, OpdsPublication& out) → bool', 'Fetch + parse a single publication document.'],
          ['resolveIndirect(docUrl, outDownloadUrl, outIsEpub) → bool', 'Resolve an indirect-acquisition link down to a real download URL.'],
          ['fetchSearchTemplate(descUrl, outTemplate) → bool', 'Fetch an OpenSearch description and return its URL template.'],
          ['downloadAuth() → HttpAuth', 'The auth to hand a downloader for the actual EPUB fetch.'],
        ]}
      />

      <H2>OpdsFeedParser</H2>
      <P>
        A streaming <Code>Print</Code> sink you pass to <Code>fetchFeed()</Code>. It auto-detects{' '}
        <strong>OPDS 1.x (Atom XML)</strong> vs <strong>OPDS 2.0 (JSON)</strong> from the first byte and
        dispatches to the right backend, so the app never picks.
      </P>
      <ApiTable
        rows={[
          ['takeEntries() → vector<OpdsEntry> / takeFacetEntries()', 'The parsed rows, and any facet/filter entries.'],
          ['getNextPageUrl() / getPrevPageUrl() / getFirstPageUrl() / getLastPageUrl()', 'Paging links; currentPage() / pageCount() report position.'],
          ['getFeedTitle() / getSearchTemplate() / getSearchDescriptionUrl()', 'Feed title and OpenSearch wiring.'],
          ['getShelfUrl() / getWishlistUrl() / getHistoryUrl()', 'Inline nav links a server advertises.'],
          ['error() / truncated() / isOpds2()', 'Parse state and which dialect was seen.'],
        ]}
      />
      <P>
        An <Code>OpdsEntry</Code> is one row — a nav link or a book — carrying <Code>title</Code>,{' '}
        <Code>author</Code>, <Code>href</Code>, <Code>coverHref</Code>, <Code>description</Code>, and two
        flags the UI acts on: <Code>indirect</Code> (href points at another publication doc, resolve
        before download) and <Code>purchase</Code> (a buy link — label the action differently).{' '}
        <Code>opdsAcquisitionRank()</Code> ranks acquisition types (open-access &gt; acquisition &gt;
        borrow/subscribe &gt; buy) so the app picks the best link. <Code>OpdsPublication</Code> carries
        the same inline metadata for a single document, plus a <Code>price</Code> string and an{' '}
        <Code>OpdsAvailability</Code> (state + copies/holds) for library and store feeds.
      </P>

      <H2>CatalogList — WebDAV / JSON listings</H2>
      <P>
        For plain file listings that aren't OPDS, <Code>CatalogList</Code> streams rows out of a WebDAV
        or JSON directory response without building a document.
      </P>
      <ApiTable
        rows={[
          ['XmlListParser', 'Streams rows from an XML list (WebDAV PROPFIND and similar), emitting each item as its element closes. UrlOptions adds skipSelf (drop the listing’s own entry), resolveUrls (resolve relative hrefs against the request URL) and an extensions allow-list.'],
          ['JsonListParser', 'The JSON equivalent — streams rows via dotted item/field paths, with an optional per-row files list. Built on StreamingJsonParser.'],
        ]}
      />

      <H2>JsonSax</H2>
      <P>
        <Code>StreamingJsonParser</Code> is the shared SAX-style primitive underneath both the OPDS 2.0
        backend and <Code>JsonListParser</Code>: byte-fed, no document tree. Register a{' '}
        <Code>JsonCallbacks</Code> set (<Code>onKey</Code> / <Code>onString</Code> / <Code>onNumber</Code>{' '}
        / object + array start/end), <Code>feed()</Code> it chunks, and check <Code>hasError()</Code>. It
        decodes UTF-16 surrogate escapes and sizes its token buffer to the OPDS limits.
      </P>

      <Callout title="All opt-in, transport-shared">
        <p>
          Each library links only when you add it to <Code>lib_deps</Code>; they share{' '}
          <A href="/docs/networking">SecureNet</A>'s TLS client (including the resumable{' '}
          <Code>fetchResumable()</Code> for the book download itself), so a catalog build reuses one
          transport rather than bundling a second HTTP stack.
        </p>
      </Callout>
    </>
  )
}
