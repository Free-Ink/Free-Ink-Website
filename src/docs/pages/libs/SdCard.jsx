import { Lead, P, H2, A, Code, ApiTable } from '../../prose.jsx'

export default function SdCard() {
  return (
    <>
      <Lead>
        SD storage with an app-friendly wrapper plus the raw <Code>FsFile</Code> API. Two
        interchangeable backends sit behind one <Code>FsVolume&amp;</Code> seam — SdFat-over-SPI
        (default) and a native 4-bit SDMMC block device (<Code>FREEINK_SD_SDMMC</Code>, e.g. de-link).
        Both hand back ordinary <Code>FsFile</Code> objects, so the API below is identical for either.
      </Lead>

      <H2>API</H2>
      <ApiTable
        rows={[
          ['begin() / ready()', 'Mount the card; report mount state.'],
          ['listFiles(path = "/", maxFiles = 200) → vector<String>', 'Directory listing.'],
          ['readFile(path) → String', 'Read a whole file (empty on failure).'],
          ['readFileToStream(path, out, chunkSize = 256)', 'Stream a file to any Print.'],
          ['readFileToBuffer(path, buffer, bufferSize, maxBytes = 0)', 'Read into a fixed buffer.'],
          ['writeFile(path, content)', 'Write a String to a file.'],
          ['exists / remove / rename / mkdir / rmdir / ensureDirectoryExists', 'Filesystem operations.'],
          ['open(path, oflag = O_RDONLY) → FsFile', 'Raw SdFat handle for streaming.'],
        ]}
      />

      <H2>Backends</H2>
      <P>
        SdFat can't drive SDIO, so boards wired for 4-bit SDMMC (de-link) mount a plain{' '}
        <Code>FsVolume</Code> on a native esp-idf SDMMC block device. Enable it with{' '}
        <Code>-DFREEINK_SD_SDMMC=1</Code> (auto-on for de-link) plus{' '}
        <Code>-DUSE_BLOCK_DEVICE_INTERFACE=1</Code>. The board's SDMMC wiring comes from{' '}
        <Code>BoardProfile.sdmmc</Code>. See <A href="/docs/build-composition">Build composition</A>.
      </P>
    </>
  )
}
