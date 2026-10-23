import {
  isWorkerRequestAuthorized,
  nsfwScoresSchema,
  quarantineKeySchema,
  readModerationThresholds
} from '@/lib/moderation/webhookAuth'
import { afterEach, describe, expect, it } from 'vitest'

const req = (auth?: string) =>
  new Request('https://app.test/hook', {
    method: 'POST',
    headers: auth ? { authorization: auth } : {}
  })

describe('isWorkerRequestAuthorized', () => {
  it('accepts the exact bearer secret', () => {
    expect(isWorkerRequestAuthorized(req('Bearer s3cret'), 's3cret')).toBe(true)
  })

  it('rejects wrong, missing, or differently sized secrets', () => {
    expect(isWorkerRequestAuthorized(req('Bearer nope'), 's3cret')).toBe(false)
    expect(isWorkerRequestAuthorized(req('Bearer s3cret!'), 's3cret')).toBe(
      false
    )
    expect(isWorkerRequestAuthorized(req(), 's3cret')).toBe(false)
  })

  it('fails closed when the secret is not configured', () => {
    expect(isWorkerRequestAuthorized(req('Bearer '), '')).toBe(false)
    expect(isWorkerRequestAuthorized(req('Bearer x'), undefined)).toBe(false)
  })
})

describe('quarantineKeySchema', () => {
  it('only accepts keys under quarantine/', () => {
    expect(
      quarantineKeySchema.safeParse('quarantine/posts/u/a.jpg').success
    ).toBe(true)
    expect(quarantineKeySchema.safeParse('posts/u/a.jpg').success).toBe(false)
    expect(quarantineKeySchema.safeParse('quarantine/../x.jpg').success).toBe(
      false
    )
    expect(quarantineKeySchema.safeParse('quarantine//x.jpg').success).toBe(
      false
    )
    expect(quarantineKeySchema.safeParse('quarantine/').success).toBe(false)
  })
})

describe('nsfwScoresSchema', () => {
  it('rejects out-of-range or non-numeric scores', () => {
    expect(nsfwScoresSchema.safeParse({ Porn: 1.5 }).success).toBe(false)
    expect(nsfwScoresSchema.safeParse({ Porn: '0.2' }).success).toBe(false)
    expect(nsfwScoresSchema.safeParse({ Porn: 0.2, Gore: 0 }).success).toBe(
      true
    )
  })
})

describe('readModerationThresholds', () => {
  const saved = { ...process.env }
  afterEach(() => {
    process.env = { ...saved }
  })

  it('falls back to defaults', () => {
    delete process.env.MODERATION_NSFW_REJECT_THRESHOLD
    delete process.env.MODERATION_NSFW_REVIEW_THRESHOLD
    delete process.env.MODERATION_STRICT_GRAY
    expect(readModerationThresholds()).toEqual({
      rejectThreshold: 0.85,
      reviewThreshold: 0.5,
      strictGray: false
    })
  })
})
