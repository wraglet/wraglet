import { describe, expect, it, vi } from 'vitest'

import {
  classifyForModeration,
  computeNsfwDecision,
  detectImageContentType,
  mergeSignals,
  parseClefSignals,
  signalsToScores,
  toBase64,
  toClefImage,
  type AiBinding,
  type ClefSignals
} from './nsfw'

const safe: ClefSignals = {
  explicit: 0.02,
  suggestive: 0.05,
  drawn: 0.03,
  gore: 0.01,
  minorSexual: 0.01
}

const clefResponse = (s: ClefSignals) => ({
  model: 'clef',
  answers: {
    explicit: { type: 'noul', noul: s.explicit },
    suggestive: { type: 'noul', noul: s.suggestive },
    drawn: { type: 'noul', noul: s.drawn },
    gore: { type: 'noul', noul: s.gore },
    minor_sexual: { type: 'noul', noul: s.minorSexual }
  }
})

const jpegBytes = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 1
])
const pngBytes = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 1
])
const webpBytes = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 1
])

describe('detectImageContentType', () => {
  it('detects jpeg, png and webp by magic bytes', () => {
    expect(detectImageContentType(jpegBytes)).toBe('image/jpeg')
    expect(detectImageContentType(pngBytes)).toBe('image/png')
    expect(detectImageContentType(webpBytes)).toBe('image/webp')
  })

  it('returns null for anything else', () => {
    expect(detectImageContentType(new Uint8Array([1, 2, 3]))).toBeNull()
    expect(
      detectImageContentType(new TextEncoder().encode('<!DOCTYPE html>'))
    ).toBeNull()
  })
})

describe('toBase64 / toClefImage', () => {
  it('base64-encodes large buffers without stack overflow', () => {
    const big = new Uint8Array(300_000).fill(0x41)
    expect(toBase64(big)).toBe(btoa('A'.repeat(300_000)))
  })

  it('rejects unsupported formats', () => {
    expect(() => toClefImage(new Uint8Array(20))).toThrow(
      /Unsupported image format/
    )
  })

  it('rejects oversize images', () => {
    const huge = new Uint8Array(4 * 1024 * 1024 + 1)
    huge.set(jpegBytes)
    expect(() => toClefImage(huge)).toThrow(/exceeds/)
  })
})

describe('parseClefSignals', () => {
  it('extracts and clamps noul probabilities', () => {
    const parsed = parseClefSignals(clefResponse({ ...safe, explicit: 1.4 }))
    expect(parsed.explicit).toBe(1)
    expect(parsed.suggestive).toBe(0.05)
  })

  it('throws on malformed responses', () => {
    expect(() => parseClefSignals({})).toThrow(/no answers/)
    expect(() =>
      parseClefSignals({ answers: { explicit: { type: 'choice' } } })
    ).toThrow(/explicit/)
  })
})

describe('signalsToScores', () => {
  it('splits explicit into Porn vs Hentai by the drawn probability', () => {
    const scores = signalsToScores({
      explicit: 0.8,
      suggestive: 0.2,
      drawn: 0.75,
      gore: 0,
      minorSexual: 0
    })
    expect(scores.Porn).toBeCloseTo(0.2)
    expect(scores.Hentai).toBeCloseTo(0.6)
    expect(scores.Drawing).toBe(0.75)
    expect(scores.Sexy).toBe(0.2)
  })

  it('derives Neutral from the highest risk signal', () => {
    expect(signalsToScores(safe).Neutral).toBeCloseTo(0.95)
    expect(signalsToScores({ ...safe, gore: 0.9 }).Neutral).toBeCloseTo(0.1)
  })
})

describe('computeNsfwDecision', () => {
  it('approves safe content', () => {
    expect(computeNsfwDecision(signalsToScores(safe), 0.85, 0.5)).toBe(
      'approve'
    )
  })

  it('reviews the gray zone and rejects explicit content', () => {
    expect(computeNsfwDecision({ Porn: 0.1, Sexy: 0.9 }, 0.85, 0.5)).toBe(
      'review'
    )
    expect(computeNsfwDecision({ Porn: 0.9 }, 0.85, 0.5)).toBe('reject')
  })

  it('treats gore like explicit content', () => {
    expect(computeNsfwDecision({ Gore: 0.6 }, 0.85, 0.5)).toBe('review')
    expect(computeNsfwDecision({ Gore: 0.95 }, 0.85, 0.5)).toBe('reject')
  })

  it('hard-rejects sexualized minors regardless of other scores', () => {
    expect(
      computeNsfwDecision({ Porn: 0.05, MinorSexual: 0.55 }, 0.85, 0.5)
    ).toBe('reject')
  })
})

describe('mergeSignals', () => {
  it('takes the element-wise max across frame batches', () => {
    const merged = mergeSignals([
      safe,
      { ...safe, gore: 0.7 },
      { ...safe, explicit: 0.4 }
    ])
    expect(merged.gore).toBe(0.7)
    expect(merged.explicit).toBe(0.4)
  })
})

describe('classifyForModeration', () => {
  const image = toClefImage(jpegBytes)

  it('calls Clef with typed questions and embedded images', async () => {
    const run = vi.fn().mockResolvedValue(clefResponse(safe))
    const ai: AiBinding = { run }

    const result = await classifyForModeration({
      ai,
      images: [image],
      rejectThreshold: 0.85,
      reviewThreshold: 0.5
    })

    expect(run).toHaveBeenCalledTimes(1)
    const [model, input] = run.mock.calls[0] as [
      string,
      Record<string, unknown>
    ]
    expect(model).toBe('@cf/cloudflare/clef')
    expect(input.model).toBe('clef')
    expect(input.images).toEqual([image])
    expect(Object.keys(input.questions as object)).toEqual([
      'explicit',
      'suggestive',
      'drawn',
      'gore',
      'minor_sexual'
    ])
    expect(result.decision).toBe('approve')
    expect(result.error).toBeUndefined()
  })

  it('batches more than four images and merges with max', async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce(clefResponse(safe))
      .mockResolvedValueOnce(clefResponse({ ...safe, explicit: 0.95 }))
    const ai: AiBinding = { run }

    const result = await classifyForModeration({
      ai,
      images: Array.from({ length: 6 }, () => image),
      rejectThreshold: 0.85,
      reviewThreshold: 0.5
    })

    expect(run).toHaveBeenCalledTimes(2)
    expect((run.mock.calls[0][1] as { images: unknown[] }).images).toHaveLength(
      4
    )
    expect((run.mock.calls[1][1] as { images: unknown[] }).images).toHaveLength(
      2
    )
    expect(result.decision).toBe('reject')
  })

  it('fails closed to review when the AI binding is missing', async () => {
    const result = await classifyForModeration({
      ai: undefined,
      images: [image],
      rejectThreshold: 0.85,
      reviewThreshold: 0.5
    })
    expect(result.decision).toBe('review')
    expect(result.error).toMatch(/AI binding/)
  })

  it('fails closed to review when inference throws', async () => {
    const ai: AiBinding = {
      run: vi.fn().mockRejectedValue(new Error('3040: out of capacity'))
    }
    const result = await classifyForModeration({
      ai,
      images: [image],
      rejectThreshold: 0.85,
      reviewThreshold: 0.5
    })
    expect(result.decision).toBe('review')
    expect(result.scores).toEqual({})
    expect(result.error).toMatch(/out of capacity/)
  })

  it('honours the synthetic test override without calling the model', async () => {
    const run = vi.fn()
    const result = await classifyForModeration({
      ai: { run },
      images: [],
      rejectThreshold: 0.85,
      reviewThreshold: 0.5,
      testExplicitOverride: '0.9'
    })
    expect(run).not.toHaveBeenCalled()
    expect(result.decision).toBe('reject')
  })
})
