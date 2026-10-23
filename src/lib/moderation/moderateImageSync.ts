import { shouldAutoApproveImages } from '@/lib/media/uploadToR2'
import {
  resolveWebhookDecision,
  type NsfwDecision
} from '@/lib/moderation/nsfwDecision'
import {
  nsfwDecisionSchema,
  nsfwScoresSchema,
  readModerationThresholds
} from '@/lib/moderation/webhookAuth'
import { z } from 'zod'

const workerResponseSchema = z.object({
  scores: nsfwScoresSchema.optional(),
  decision: nsfwDecisionSchema.optional()
})

const WORKER_TIMEOUT_MS = 20_000

/**
 * Classifies a quarantined image synchronously via `workers/moderation-image`
 * (no callback). Used for surfaces without a document to update asynchronously
 * (blog images). Fails closed: any transport/parse failure yields `review`.
 */
export const moderateQuarantinedImageSync = async (input: {
  quarantineKey: string
  surface: string
  userId: string
}): Promise<NsfwDecision> => {
  if (shouldAutoApproveImages()) {
    return 'approve'
  }

  const workerUrl = process.env.MODERATION_WORKER_URL
  const secret = process.env.MODERATION_WORKER_SECRET
  if (!workerUrl || !secret) {
    return 'review'
  }

  try {
    const response = await fetch(
      `${workerUrl.replace(/\/$/, '')}/moderate-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`
        },
        body: JSON.stringify({
          key: input.quarantineKey,
          userId: input.userId,
          surface: input.surface
        }),
        signal: AbortSignal.timeout(WORKER_TIMEOUT_MS)
      }
    )
    if (!response.ok) {
      console.error('Sync image moderation failed:', response.status)
      return 'review'
    }
    const parsed = workerResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      return 'review'
    }
    const { rejectThreshold, reviewThreshold } = readModerationThresholds()
    return resolveWebhookDecision({
      scores: parsed.data.scores,
      workerDecision: parsed.data.decision,
      rejectThreshold,
      reviewThreshold
    })
  } catch (error) {
    console.error('Sync image moderation failed:', error)
    return 'review'
  }
}
