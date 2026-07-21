import { Lead, P, H2, A, Ul, Li, Code, CodeBlock, Callout } from '../prose.jsx'

export default function Networking() {
  return (
    <>
      <Lead>
        <Code>SecureNet</Code> brings its own TLS stack — wolfSSL compiled from source — so the reader
        can reach TLS-1.3-only servers that the platform's stubbed mbedTLS can't.
      </Lead>

      <H2>The problem</H2>
      <P>
        The precompiled mbedTLS in the ESP-IDF / pioarduino package ships TLS 1.3 as empty stubs, so{' '}
        <Code>WiFiClientSecure</Code> / <Code>esp_http_client</Code> cannot reach TLS-1.3-only servers —
        e.g. KOSync at <Code>kosync.ak-team.com:3042</Code>, where the handshake fails with{' '}
        <Code>-0x7780</Code>. A <Code>-D</Code> flag can't change a precompiled <Code>.a</Code>, and a
        from-source ESP-IDF rebuild is a heavier path.
      </P>

      <H2>The solution</H2>
      <P>
        <Code>SecureNet</Code> bundles <strong>wolfSSL compiled from source</strong>, which supports TLS
        1.3 + PSA and bypasses system mbedTLS entirely. It exposes two pieces:
      </P>
      <Ul>
        <Li>
          <Code>freeink::SecureClient</Code> — an Arduino <Code>Client</Code> doing TLS 1.3 over{' '}
          <Code>WiFiClient</Code>, with a <strong>TLS 1.2 fallback</strong> for servers that are
          intolerant of a 1.3 handshake.
        </Li>
        <Li>
          <Code>freeink::SecureHttpClient</Code> — a <strong>standalone</strong> HTTPS client
          (<Code>GET</Code> / <Code>POST</Code> / <Code>PUT</Code> with custom headers and a buffered
          response body; handles Content-Length, chunked and connection-close framing). It's{' '}
          <em>deliberately not</em> a wrapper over Arduino <Code>HTTPClient</Code> — that binds a{' '}
          <Code>NetworkClient</Code>, and <Code>SecureClient</Code> is a plain <Code>Client</Code> running
          wolfSSL over its own transport — but it keeps the familiar call shape
          (<Code>begin()</Code> / <Code>addHeader()</Code> / <Code>GET()</Code> / <Code>getString()</Code>,
          plus <Code>setInsecure()</Code> / <Code>setCACert()</Code>).
        </Li>
      </Ul>
      <P>
        <Code>SecureHttpClient</Code> has grown into a real HTTP/1.1 client: <strong>streaming</strong>{' '}
        responses (<Code>GET(onData, shouldAbort)</Code> hands the body back in chunks instead of
        buffering it), <strong>connection keep-alive</strong> across requests (<Code>setReuse(true)</Code>),
        <strong> opt-in redirect following</strong> (<Code>setFollowRedirects(maxHops)</Code>, with{' '}
        <Code>setAllowRedirectDowngrade()</Code> for https→http), <strong>HTTP Basic auth</strong>{' '}
        (<Code>setBasicAuth(user, pass)</Code>), a custom <Code>setUserAgent()</Code> sent on every
        request, and a <Code>setProgressCallback()</Code> (return false to abort a long download).
      </P>

      <H2>Enabling it</H2>
      <P>
        It's opt-in: <Code>-DFREEINK_NET_WOLFSSL=1</Code> plus a wolfSSL source <Code>lib_dep</Code>.
        With the flag off it compiles to an inert stub, so the rest of the SDK builds without wolfSSL.
      </P>
      <CodeBlock lang="platformio.ini">{`build_flags = -DFREEINK_NET_WOLFSSL=1
lib_deps =
  SecureNet=symlink://path/to/freeink-sdk/libs/network/SecureNet
  ; + a wolfSSL source library dependency`}</CodeBlock>

      <Callout title="Capability flag">
        <p>
          <Code>FREEINK_CAP_NET_TLS13</Code> is equivalent to <Code>FREEINK_NET_WOLFSSL</Code> in the{' '}
          <A href="/docs/build-composition">capability matrix</A>. Both default off.
        </p>
      </Callout>
    </>
  )
}
