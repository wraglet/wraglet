/**
 * Shared NSFW classification for Wraglet Cloudflare Workers.
 *
 * Uses Cloudflare's Clef decision model on Workers AI. Clef answers typed
 * yes/no questions with calibrated probabilities (no free-text parsing), and
 * accepts up to 4 embedded images per request.
 *
 * The output keeps the `NsfwScores` shape the Next.js app already stores
 * (`Porn`, `Hentai`, `Sexy`, `Drawing`, `Neutral`) and adds `Gore` and
 * `MinorSexual` so the admin review queue can see why something was flagged.
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

export type ClefSignals = {
  explicit: number
  suggestive: number
  drawn: number
  gore: number
  minorSexual: number
}

export type ClefImage = {
  content_type: 'image/jpeg' | 'image/png' | 'image/webp'
  base64: string
}

export type AiBinding = {
  run(model: string, input: Record<string, unknown>): Promise<unknown>
}

export const DEFAULT_NSFW_MODEL = '@cf/cloudflare/clef'

/** Clef hard limit per embedded image. */
export const CLEF_MAX_IMAGE_BYTES = 4 * 1024 * 1024
/** Clef hard limit on images per request. */
export const CLEF_MAX_IMAGES = 4

export const MODERATION_STATE =
  'Content moderation for a general-audience social network where minors may be present. ' +
  'Evaluate ONLY the attached image(s). Answer each question about what is visibly depicted. ' +
  'When several images are attached they are frames sampled from one video; answer yes if ANY frame matches.'

export const NSFW_QUESTIONS = {
  explicit: {
    type: 'noul',
    instructions:
      'Does the image show explicit sexual content: exposed genitals, exposed buttocks or female nipples, ' +
      'sexual acts, masturbation, or pornography?'
  },
  suggestive: {
    type: 'noul',
    instructions:
      'Is the image sexually suggestive without being explicit, such as lingerie or revealing swimwear, ' +
      'provocative or erotic posing, or partial nudity with genitals and nipples covered?'
  },
  drawn: {
    type: 'noul',
    instructions:
      'Is the image a drawing, cartoon, anime, illustration, or computer-generated render rather than a photograph?'
  },
  gore: {
    type: 'noul',
    instructions:
      'Does the image show graphic violence, gore, mutilation, severe bloody injury, or a dead body?'
  },
  minor_sexual: {
    type: 'noul',
    instructions:
      'Does the image sexualize a person who appears to be a child or under 18 (nudity, sexual posing, ' +
      'or sexual context involving a minor)?'
  }
} as const

const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

export const toBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export const detectImageContentType = (
  bytes: Uint8Array
): ClefImage['content_type'] | null => {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg'
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export const toClefImage = (bytes: Uint8Array): ClefImage => {
  const contentType = detectImageContentType(bytes)
  if (!contentType) {
    throw new Error('Unsupported image format (expected JPEG, PNG or WebP)')
  }
  if (bytes.byteLength > CLEF_MAX_IMAGE_BYTES) {
    throw new Error(`Image exceeds ${CLEF_MAX_IMAGE_BYTES} bytes`)
  }
  return { content_type: contentType, base64: toBase64(bytes) }
}

const readNoul = (answers: Record<string, unknown>, id: string): number => {
  const answer = answers[id] as { type?: string; noul?: unknown } | undefined
  if (!answer || answer.type !== 'noul' || typeof answer.noul !== 'number') {
    throw new Error(`Clef response missing noul answer for "${id}"`)
  }
  return clamp01(answer.noul)
}

export const parseClefSignals = (response: unknown): ClefSignals => {
  const answers = (response as { answers?: Record<string, unknown> } | null)
    ?.answers
  if (!answers || typeof answers !== 'object') {
    throw new Error('Clef response has no answers')
  }
  return {
    explicit: readNoul(answers, 'explicit'),
    suggestive: readNoul(answers, 'suggestive'),
    drawn: readNoul(answers, 'drawn'),
    gore: readNoul(answers, 'gore'),
    minorSexual: readNoul(answers, 'minor_sexual')
  }
}

/** Element-wise max — used to merge several video-frame batches. */
export const mergeSignals = (list: ClefSignals[]): ClefSignals => {
  if (list.length === 0) {
    throw new Error('No signals to merge')
  }
  return list.reduce((acc, cur) => ({
    explicit: Math.max(acc.explicit, cur.explicit),
    suggestive: Math.max(acc.suggestive, cur.suggestive),
    drawn: Math.max(acc.drawn, cur.drawn),
    gore: Math.max(acc.gore, cur.gore),
    minorSexual: Math.max(acc.minorSexual, cur.minorSexual)
  }))
}

export const signalsToScores = (signals: ClefSignals): NsfwScores => {
  const { explicit, suggestive, drawn, gore, minorSexual } = signals
  const risk = Math.max(explicit, suggestive, gore, minorSexual)
  return {
    Porn: round(explicit * (1 - drawn)),
    Hentai: round(explicit * drawn),
    Sexy: round(suggestive),
    Drawing: round(drawn),
    Gore: round(gore),
    MinorSexual: round(minorSexual),
    Neutral: round(clamp01(1 - risk))
  }
}

const round = (value: number): number => Math.round(value * 10000) / 10000

/** Matches the app's `computeExplicitScore` so thresholds behave the same everywhere. */
export const computeExplicitScore = (scores: NsfwScores): number =>
  (scores.Porn ?? 0) + (scores.Hentai ?? 0) + (scores.Sexy ?? 0) * 0.5

/** Anything that sexualizes a minor is rejected outright at this probability. */
export const MINOR_SEXUAL_REJECT_THRESHOLD = 0.5

export const computeNsfwDecision = (
  scores: NsfwScores,
  rejectThreshold: number,
  reviewThreshold: number
): NsfwDecision => {
  if ((scores.MinorSexual ?? 0) >= MINOR_SEXUAL_REJECT_THRESHOLD)
    return 'reject'
  const risk = Math.max(computeExplicitScore(scores), scores.Gore ?? 0)
  if (risk >= rejectThreshold) return 'reject'
  if (risk >= reviewThreshold) return 'review'
  return 'approve'
}

/** Synthetic signals for the `TEST_NSFW_EXPLICIT_SCORE` override used in staging smoke tests. */
export const syntheticSignals = (explicit: number): ClefSignals => ({
  explicit: clamp01(explicit),
  suggestive: clamp01(explicit * 0.2),
  drawn: 0.01,
  gore: 0,
  minorSexual: 0
})

export const classifyImagesWithClef = async (
  ai: AiBinding,
  images: ClefImage[],
  options?: { model?: string; state?: string }
): Promise<ClefSignals> => {
  if (images.length === 0 || images.length > CLEF_MAX_IMAGES) {
    throw new Error(`Clef accepts 1-${CLEF_MAX_IMAGES} images per request`)
  }
  const modelId = options?.model ?? DEFAULT_NSFW_MODEL
  const selector = modelId.endsWith('clef-flash') ? 'clef-flash' : 'clef'

  const response = await ai.run(modelId, {
    model: selector,
    state: options?.state ?? MODERATION_STATE,
    images,
    questions: NSFW_QUESTIONS
  })

  return parseClefSignals(response)
}

export type ClassificationResult = {
  scores: NsfwScores
  decision: NsfwDecision
  maxExplicit: number
  model: string
  error?: string
}

/**
 * Classifies one or more images. Never throws: on any failure the decision is
 * `review` (fail closed) and `error` carries the reason for logging/admin UI.
 */
export const classifyForModeration = async (input: {
  ai: AiBinding | undefined
  images: ClefImage[]
  model?: string
  rejectThreshold: number
  reviewThreshold: number
  testExplicitOverride?: string
}): Promise<ClassificationResult> => {
  const model = input.model ?? DEFAULT_NSFW_MODEL

  const finish = (
    signals: ClefSignals,
    error?: string
  ): ClassificationResult => {
    const scores = signalsToScores(signals)
    return {
      scores,
      decision: computeNsfwDecision(
        scores,
        input.rejectThreshold,
        input.reviewThreshold
      ),
      maxExplicit: computeExplicitScore(scores),
      model,
      ...(error ? { error } : {})
    }
  }

  if (
    input.testExplicitOverride !== undefined &&
    input.testExplicitOverride !== ''
  ) {
    return finish(syntheticSignals(Number(input.testExplicitOverride)))
  }

  if (!input.ai) {
    return {
      scores: {},
      decision: 'review',
      maxExplicit: 0,
      model,
      error: 'AI binding not configured'
    }
  }

  try {
    const batches: ClefImage[][] = []
    for (let i = 0; i < input.images.length; i += CLEF_MAX_IMAGES) {
      batches.push(input.images.slice(i, i + CLEF_MAX_IMAGES))
    }
    const results = await Promise.all(
      batches.map((batch) =>
        classifyImagesWithClef(input.ai as AiBinding, batch, { model })
      )
    )
    return finish(mergeSignals(results))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('NSFW classification failed:', message)
    return {
      scores: {},
      decision: 'review',
      maxExplicit: 0,
      model,
      error: message
    }
  }
}
