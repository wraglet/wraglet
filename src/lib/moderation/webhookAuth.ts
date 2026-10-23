import { timingSafeEqual } from 'node:crypto'
import type { NsfwScores } from '@/lib/moderation/nsfwDecision'
import { z } from 'zod'

const QUARANTINE_PREFIX = 'quarantine/'

/**
 * Validates `Authorization: Bearer <secret>` from a moderation Worker without
 * leaking timing information. Fails closed when the secret is not configured.
 */
export const isWorkerRequestAuthorized = (
  request: Request,
  secret: string | undefined
): boolean => {
  if (!secret) {
    return false
  }
  const header = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(header, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) {
    return false
  }
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** Workers may only act on objects the app placed under `quarantine/`. */
export const quarantineKeySchema = z
  .string()
  .min(QUARANTINE_PREFIX.length + 1)
  .max(1024)
  .refine(
    (key) =>
      key.startsWith(QUARANTINE_PREFIX) &&
      !key.includes('..') &&
      !key.includes('//') &&
      !key.includes('\\'),
    { message: 'Key must point to a quarantine object' }
  )

export const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i)

const scoreValue = z.number().min(0).max(1)

export const nsfwScoresSchema: z.ZodType<NsfwScores> = z.object({
  Drawing: scoreValue.optional(),
  Hentai: scoreValue.optional(),
  Neutral: scoreValue.optional(),
  Porn: scoreValue.optional(),
  Sexy: scoreValue.optional(),
  Gore: scoreValue.optional(),
  MinorSexual: scoreValue.optional()
})

export const nsfwDecisionSchema = z.enum(['approve', 'reject', 'review'])

export const readModerationThresholds = () => ({
  rejectThreshold: Number(process.env.MODERATION_NSFW_REJECT_THRESHOLD ?? 0.85),
  reviewThreshold: Number(process.env.MODERATION_NSFW_REVIEW_THRESHOLD ?? 0.5),
  strictGray: process.env.MODERATION_STRICT_GRAY === 'true'
})
