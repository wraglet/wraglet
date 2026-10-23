import {
  computeExplicitScore,
  computeNsfwDecision,
  hasAnyScore,
  moderationStatusFromDecision,
  resolveWebhookDecision,
  strictestDecision
} from '@/lib/moderation/nsfwDecision'
import { describe, expect, it } from 'vitest'

const thresholds = { rejectThreshold: 0.85, reviewThreshold: 0.5 }

describe('nsfwDecision', () => {
  it('computes explicit score with sexy weighted', () => {
    expect(
      computeExplicitScore({ Porn: 0.4, Hentai: 0.2, Sexy: 0.2, Neutral: 0.2 })
    ).toBeCloseTo(0.7)
  })

  it('rejects high explicit scores', () => {
    expect(
      computeNsfwDecision({ Porn: 0.7, Hentai: 0.2, Sexy: 0.1 }, thresholds)
    ).toBe('reject')
  })

  it('flags gray zone as review', () => {
    expect(
      computeNsfwDecision({ Porn: 0.3, Hentai: 0.2, Sexy: 0.2 }, thresholds)
    ).toBe('review')
  })

  it('treats gore like explicit content', () => {
    expect(computeNsfwDecision({ Gore: 0.6 }, thresholds)).toBe('review')
    expect(computeNsfwDecision({ Gore: 0.9 }, thresholds)).toBe('reject')
  })

  it('hard-rejects sexualized minors regardless of other scores', () => {
    expect(
      computeNsfwDecision({ Porn: 0.01, MinorSexual: 0.5 }, thresholds)
    ).toBe('reject')
  })

  it('maps review to needs_review by default', () => {
    expect(moderationStatusFromDecision('review', false)).toBe('needs_review')
    expect(moderationStatusFromDecision('review', true)).toBe('pending')
  })

  it('orders decisions by severity', () => {
    expect(strictestDecision('approve', 'review')).toBe('review')
    expect(strictestDecision('reject', 'review')).toBe('reject')
    expect(strictestDecision('approve', 'approve')).toBe('approve')
  })

  it('detects empty score payloads', () => {
    expect(hasAnyScore({})).toBe(false)
    expect(hasAnyScore(undefined)).toBe(false)
    expect(hasAnyScore({ Neutral: 0.9 })).toBe(true)
  })
})

describe('resolveWebhookDecision', () => {
  it('never lets a worker decision be more lenient than the scores', () => {
    expect(
      resolveWebhookDecision({
        scores: { Porn: 0.95 },
        workerDecision: 'approve',
        ...thresholds
      })
    ).toBe('reject')
  })

  it('honours a stricter worker decision', () => {
    expect(
      resolveWebhookDecision({
        scores: { Neutral: 0.99 },
        workerDecision: 'review',
        ...thresholds
      })
    ).toBe('review')
  })

  it('fails closed on empty scores', () => {
    expect(resolveWebhookDecision({ scores: {}, ...thresholds })).toBe('review')
    expect(
      resolveWebhookDecision({
        scores: {},
        workerDecision: 'approve',
        ...thresholds
      })
    ).toBe('review')
    expect(
      resolveWebhookDecision({
        scores: undefined,
        workerDecision: 'reject',
        ...thresholds
      })
    ).toBe('reject')
  })

  it('computes from scores when no worker decision is present', () => {
    expect(
      resolveWebhookDecision({ scores: { Neutral: 0.98 }, ...thresholds })
    ).toBe('approve')
  })
})
