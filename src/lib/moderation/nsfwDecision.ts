/**
 * Score → decision rules. Keep in sync with `workers/shared/nsfw.ts`
 * (`computeNsfwDecision`), which is the primary implementation running in the Worker;
 * the app re-applies the same rules so a webhook can never be more lenient than the scores.
 */
export type NsfwScores = {
  Drawing?: number
  Hentai?: number
  Neutral?: number
  Porn?: number
  Sexy?: number
  Gore?: number
  MinorSexual?: number
}

export type NsfwDecision = 'approve' | 'reject' | 'review'

export const DEFAULT_REJECT_THRESHOLD = 0.85
export const DEFAULT_REVIEW_THRESHOLD = 0.5
/** Any credible signal of a sexualized minor is a hard reject, independent of other scores. */
export const MINOR_SEXUAL_REJECT_THRESHOLD = 0.5

const DECISION_SEVERITY: Record<NsfwDecision, number> = {
  approve: 0,
  review: 1,
  reject: 2
}

export const computeExplicitScore = (scores: NsfwScores): number =>
  (scores.Porn ?? 0) + (scores.Hentai ?? 0) + (scores.Sexy ?? 0) * 0.5

export const hasAnyScore = (scores: NsfwScores | undefined | null): boolean =>
  Boolean(scores) &&
  Object.values(scores as Record<string, unknown>).some(
    (v) => typeof v === 'number' && Number.isFinite(v)
  )

export const computeNsfwDecision = (
  scores: NsfwScores,
  options?: {
    rejectThreshold?: number
    reviewThreshold?: number
  }
): NsfwDecision => {
  const rejectThreshold = options?.rejectThreshold ?? DEFAULT_REJECT_THRESHOLD
  const reviewThreshold = options?.reviewThreshold ?? DEFAULT_REVIEW_THRESHOLD

  if ((scores.MinorSexual ?? 0) >= MINOR_SEXUAL_REJECT_THRESHOLD) {
    return 'reject'
  }

  const risk = Math.max(computeExplicitScore(scores), scores.Gore ?? 0)

  if (risk >= rejectThreshold) {
    return 'reject'
  }
  if (risk >= reviewThreshold) {
    return 'review'
  }
  return 'approve'
}

/** Returns the more severe of two decisions (reject > review > approve). */
export const strictestDecision = (
  a: NsfwDecision,
  b: NsfwDecision
): NsfwDecision => (DECISION_SEVERITY[a] >= DECISION_SEVERITY[b] ? a : b)

/**
 * Final decision for a webhook payload. The Worker's own decision is honoured only
 * when it is at least as strict as what the scores imply; empty scores fail closed.
 */
export const resolveWebhookDecision = (input: {
  scores: NsfwScores | undefined | null
  workerDecision?: NsfwDecision
  rejectThreshold?: number
  reviewThreshold?: number
}): NsfwDecision => {
  if (!hasAnyScore(input.scores)) {
    return input.workerDecision === 'reject' ? 'reject' : 'review'
  }
  const computed = computeNsfwDecision(input.scores as NsfwScores, input)
  return input.workerDecision
    ? strictestDecision(input.workerDecision, computed)
    : computed
}

/**
 * Why a reject happened, from the scores that drove it. Minor safety wins over
 * everything else; gore wins when it is at least as strong as the explicit score.
 * Falls back to `explicit` when the payload has no distinguishing signal.
 */
export const rejectedReasonFromScores = (
  scores: NsfwScores | undefined | null,
  options?: { rejectThreshold?: number }
): 'explicit' | 'gore' | 'minor' => {
  if ((scores?.MinorSexual ?? 0) >= MINOR_SEXUAL_REJECT_THRESHOLD) {
    return 'minor'
  }
  const rejectThreshold = options?.rejectThreshold ?? DEFAULT_REJECT_THRESHOLD
  const gore = scores?.Gore ?? 0
  const explicit = scores ? computeExplicitScore(scores) : 0
  if (gore >= rejectThreshold && gore >= explicit) {
    return 'gore'
  }
  return 'explicit'
}

export const moderationStatusFromDecision = (
  decision: NsfwDecision,
  strictGray: boolean
): 'approved' | 'rejected' | 'needs_review' | 'pending' => {
  if (decision === 'reject') {
    return 'rejected'
  }
  if (decision === 'review') {
    return strictGray ? 'pending' : 'needs_review'
  }
  return 'approved'
}
