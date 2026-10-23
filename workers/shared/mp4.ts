/**
 * Minimal ISO BMFF (MP4 / MOV) duration probe.
 *
 * The app only knows the duration the browser reported, which a hostile client can
 * understate so that frame sampling misses the end of the video. Reading `moov/mvhd`
 * straight from the uploaded bytes gives us the real duration without a decoder.
 */

/** Reads `length` bytes at `offset`; returns null when the range is unavailable. */
export type RangeReader = (
  offset: number,
  length: number
) => Promise<Uint8Array | null>

const MAX_TOP_LEVEL_BOXES = 64
/** `moov` is metadata only; anything larger than this is not a sane upload. */
const MAX_MOOV_BYTES = 32 * 1024 * 1024

const readU32 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) >>> 0) +
  (bytes[offset + 1] << 16) +
  (bytes[offset + 2] << 8) +
  bytes[offset + 3]

const readU64 = (bytes: Uint8Array, offset: number): number =>
  readU32(bytes, offset) * 0x100000000 + readU32(bytes, offset + 4)

const readType = (bytes: Uint8Array, offset: number): string =>
  String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3]
  )

type BoxHeader = { type: string; size: number; headerLength: number }

const parseBoxHeader = (
  bytes: Uint8Array,
  offset: number,
  remaining: number
): BoxHeader | null => {
  if (offset + 8 > bytes.length) return null
  const size32 = readU32(bytes, offset)
  const type = readType(bytes, offset + 4)
  if (size32 === 1) {
    if (offset + 16 > bytes.length) return null
    return { type, size: readU64(bytes, offset + 8), headerLength: 16 }
  }
  if (size32 === 0) {
    return { type, size: remaining, headerLength: 8 }
  }
  return { type, size: size32, headerLength: 8 }
}

/** Finds `mvhd` inside an in-memory `moov` box and converts its duration to seconds. */
export const parseMvhdDurationSec = (
  moov: Uint8Array,
  moovHeaderLength: number
): number | null => {
  let offset = moovHeaderLength
  while (offset + 8 <= moov.length) {
    const box = parseBoxHeader(moov, offset, moov.length - offset)
    if (!box || box.size < box.headerLength) return null
    if (box.type === 'mvhd') {
      const body = offset + box.headerLength
      const version = moov[body]
      if (version === 0) {
        if (body + 20 > moov.length) return null
        const timescale = readU32(moov, body + 12)
        const duration = readU32(moov, body + 16)
        return timescale > 0 ? duration / timescale : null
      }
      if (version === 1) {
        if (body + 32 > moov.length) return null
        const timescale = readU32(moov, body + 20)
        const duration = readU64(moov, body + 24)
        return timescale > 0 ? duration / timescale : null
      }
      return null
    }
    offset += box.size
  }
  return null
}

/**
 * Walks the top-level boxes with ranged reads until `moov` is found.
 * Returns null for non-ISO-BMFF files (first box must be `ftyp`) or malformed input.
 */
export const probeMp4DurationSec = async (
  read: RangeReader,
  fileSize: number
): Promise<number | null> => {
  let offset = 0
  for (let i = 0; i < MAX_TOP_LEVEL_BOXES && offset + 8 <= fileSize; i += 1) {
    const header = await read(offset, Math.min(16, fileSize - offset))
    if (!header) return null
    const box = parseBoxHeader(header, 0, fileSize - offset)
    if (!box || box.size < box.headerLength) return null
    if (i === 0 && box.type !== 'ftyp') return null

    if (box.type === 'moov') {
      if (box.size > MAX_MOOV_BYTES) return null
      const moov = await read(offset, box.size)
      if (!moov || moov.length < box.size) return null
      return parseMvhdDurationSec(moov, box.headerLength)
    }
    offset += box.size
  }
  return null
}
