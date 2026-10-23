import { describe, expect, it } from 'vitest'

import { parseMvhdDurationSec, probeMp4DurationSec } from './mp4'

const u32 = (n: number): number[] => [
  (n >>> 24) & 0xff,
  (n >>> 16) & 0xff,
  (n >>> 8) & 0xff,
  n & 0xff
]

const ascii = (s: string): number[] => [...s].map((c) => c.charCodeAt(0))

const box = (type: string, payload: number[]): number[] => [
  ...u32(8 + payload.length),
  ...ascii(type),
  ...payload
]

const mvhdV0 = (timescale: number, duration: number): number[] =>
  box('mvhd', [
    0, // version
    0,
    0,
    0, // flags
    ...u32(0), // creation
    ...u32(0), // modification
    ...u32(timescale),
    ...u32(duration),
    ...new Array(80).fill(0) // rate, volume, matrix, etc.
  ])

const mvhdV1 = (timescale: number, duration: number): number[] =>
  box('mvhd', [
    1,
    0,
    0,
    0,
    ...u32(0),
    ...u32(0), // creation (64-bit)
    ...u32(0),
    ...u32(0), // modification (64-bit)
    ...u32(timescale),
    ...u32(0),
    ...u32(duration), // duration (64-bit, high word zero)
    ...new Array(80).fill(0)
  ])

const buildMp4 = (mvhd: number[], mdatBytes = 1000): Uint8Array =>
  Uint8Array.from([
    ...box('ftyp', [...ascii('isom'), ...u32(512), ...ascii('isomiso2')]),
    ...box('free', new Array(16).fill(0)),
    ...box('mdat', new Array(mdatBytes).fill(0)),
    ...box('moov', [...box('iods', [0, 0, 0, 0]), ...mvhd])
  ])

const readerFor =
  (file: Uint8Array) =>
  async (offset: number, length: number): Promise<Uint8Array | null> =>
    offset >= file.length ? null : file.subarray(offset, offset + length)

describe('parseMvhdDurationSec', () => {
  it('reads version 0 and version 1 headers', () => {
    const moov0 = Uint8Array.from(box('moov', mvhdV0(1000, 12_500)))
    expect(parseMvhdDurationSec(moov0, 8)).toBeCloseTo(12.5)

    const moov1 = Uint8Array.from(box('moov', mvhdV1(90_000, 90_000 * 61)))
    expect(parseMvhdDurationSec(moov1, 8)).toBeCloseTo(61)
  })

  it('returns null when mvhd is missing or truncated', () => {
    expect(parseMvhdDurationSec(Uint8Array.from(box('moov', [])), 8)).toBeNull()
    const truncated = Uint8Array.from(box('moov', mvhdV0(1000, 5000))).subarray(
      0,
      20
    )
    expect(parseMvhdDurationSec(truncated, 8)).toBeNull()
  })
})

describe('probeMp4DurationSec', () => {
  it('walks top-level boxes with ranged reads until moov (moov after mdat)', async () => {
    const file = buildMp4(mvhdV0(600, 600 * 42))
    const reads: number[] = []
    const read = async (offset: number, length: number) => {
      reads.push(length)
      return readerFor(file)(offset, length)
    }
    await expect(probeMp4DurationSec(read, file.length)).resolves.toBeCloseTo(
      42
    )
    // Header peeks are tiny; only moov itself is read in full.
    expect(reads.filter((l) => l <= 16)).toHaveLength(4)
  })

  it('returns null for non-MP4 containers (no ftyp first)', async () => {
    const webmish = Uint8Array.from([
      0x1a,
      0x45,
      0xdf,
      0xa3,
      ...new Array(64).fill(0)
    ])
    await expect(
      probeMp4DurationSec(readerFor(webmish), webmish.length)
    ).resolves.toBeNull()
  })

  it('returns null when the reader fails', async () => {
    const file = buildMp4(mvhdV0(1000, 1000))
    await expect(
      probeMp4DurationSec(async () => null, file.length)
    ).resolves.toBeNull()
  })
})
