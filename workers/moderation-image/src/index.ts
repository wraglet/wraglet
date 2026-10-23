import {
  classifyForModeration,
  toClefImage,
  type AiBinding,
  type ClassificationResult
} from '../../shared/nsfw'
import {
  isAllowedCallbackUrl,
  isBearerAuthorized,
  isQuarantineKey
} from '../../shared/security'

export interface Env {
  MODERATION_WORKER_SECRET: string
  /** `production` | `staging` | `development`; test overrides are refused in production. */
  ENVIRONMENT?: string
  /** Comma-separated hostnames the Worker may call back (defaults to any https host). */
  ALLOWED_CALLBACK_HOSTS?: string
  MODERATION_NSFW_REJECT_THRESHOLD?: string
  MODERATION_NSFW_REVIEW_THRESHOLD?: string
  /** Workers AI model id. Defaults to `@cf/cloudflare/clef`; use `@cf/cloudflare/clef-flash` for lower latency. */
  NSFW_MODEL?: string
  /** Staging-only: force a synthetic explicit score (0..1) to exercise reject/review paths. */
  TEST_NSFW_EXPLICIT_SCORE?: string
  R2_BUCKET?: R2Bucket
  AI?: AiBinding
}

type ModerateImageRequest = {
  key: string
  bucket?: string
  postId?: string
  userId?: string
  surface?: string
  callbackUrl?: string
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const loadImage = async (
  env: Env,
  key: string
): Promise<{ bytes: Uint8Array } | { error: string; status: number }> => {
  if (!env.R2_BUCKET) {
    return { error: 'R2 bucket not bound', status: 500 }
  }
  const object = await env.R2_BUCKET.get(key)
  if (!object) {
    return { error: 'Object not found', status: 404 }
  }
  return { bytes: new Uint8Array(await object.arrayBuffer()) }
}

const sendCallback = async (
  env: Env,
  body: ModerateImageRequest,
  result: ClassificationResult
): Promise<void> => {
  if (!body.callbackUrl) return
  try {
    const response = await fetch(body.callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MODERATION_WORKER_SECRET}`
      },
      body: JSON.stringify({
        key: body.key,
        postId: body.postId,
        userId: body.userId,
        surface: body.surface,
        scores: result.scores,
        decision: result.decision,
        model: result.model,
        error: result.error
      })
    })
    if (!response.ok) {
      console.error(
        'Callback to wraglet failed:',
        response.status,
        await response.text()
      )
    }
  } catch (error) {
    console.error('Callback to wraglet failed:', error)
  }
}

const moderationImageWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method !== 'POST' || url.pathname !== '/moderate-image') {
      return new Response('Not found', { status: 404 })
    }

    if (
      !isBearerAuthorized(
        request.headers.get('authorization'),
        env.MODERATION_WORKER_SECRET
      )
    ) {
      return json({ error: 'Unauthorized' }, 401)
    }

    let body: ModerateImageRequest
    try {
      body = (await request.json()) as ModerateImageRequest
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    if (!isQuarantineKey(body.key)) {
      return json({ error: 'key must point to a quarantine object' }, 400)
    }
    if (
      body.callbackUrl !== undefined &&
      !isAllowedCallbackUrl(body.callbackUrl, env.ALLOWED_CALLBACK_HOSTS)
    ) {
      return json({ error: 'callbackUrl not allowed' }, 400)
    }

    const rejectThreshold = Number(env.MODERATION_NSFW_REJECT_THRESHOLD ?? 0.85)
    const reviewThreshold = Number(env.MODERATION_NSFW_REVIEW_THRESHOLD ?? 0.5)
    const testOverride =
      env.ENVIRONMENT === 'production'
        ? undefined
        : env.TEST_NSFW_EXPLICIT_SCORE

    let result: ClassificationResult

    if (testOverride !== undefined && testOverride !== '') {
      result = await classifyForModeration({
        ai: env.AI,
        images: [],
        model: env.NSFW_MODEL,
        rejectThreshold,
        reviewThreshold,
        testExplicitOverride: testOverride
      })
    } else {
      const loaded = await loadImage(env, body.key)
      if ('error' in loaded) {
        return json({ error: loaded.error }, loaded.status)
      }

      try {
        const image = toClefImage(loaded.bytes)
        result = await classifyForModeration({
          ai: env.AI,
          images: [image],
          model: env.NSFW_MODEL,
          rejectThreshold,
          reviewThreshold
        })
      } catch (error) {
        // Unsupported format / oversize: fail closed and let a human look.
        const message = error instanceof Error ? error.message : String(error)
        result = {
          scores: {},
          decision: 'review',
          maxExplicit: 0,
          model: env.NSFW_MODEL ?? 'none',
          error: message
        }
      }
    }

    console.log(
      JSON.stringify({
        event: 'image_moderated',
        key: body.key,
        surface: body.surface,
        decision: result.decision,
        maxExplicit: result.maxExplicit,
        gore: result.scores.Gore,
        minorSexual: result.scores.MinorSexual,
        model: result.model,
        error: result.error
      })
    )

    await sendCallback(env, body, result)

    return json(result)
  }
}

export default moderationImageWorker
