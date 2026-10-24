import Post from '@/models/Post'

/**
 * Hands a completed quarantine upload to `workers/video-pipeline`.
 * Must be called inside `after()` (or awaited) so the serverless function stays alive;
 * a failure to reach the Worker is recorded on the post so admins can see why it is stuck.
 */
export const triggerVideoPipeline = async (input: {
  postId: string
  quarantineKey: string
  durationSec: number
}): Promise<void> => {
  const workerUrl = process.env.VIDEO_WORKER_URL
  const secret = process.env.VIDEO_WORKER_SECRET
  if (!workerUrl || !secret) {
    return
  }

  const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/moderation/video-complete`
    : undefined

  let failure: string | null = null
  try {
    const response = await fetch(
      `${workerUrl.replace(/\/$/, '')}/process-video`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secret}`
        },
        body: JSON.stringify({
          postId: input.postId,
          key: input.quarantineKey,
          durationSec: input.durationSec,
          callbackUrl
        })
      }
    )
    if (!response.ok) {
      failure = `Worker responded ${response.status}`
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error)
  }

  if (failure) {
    console.error('Failed to trigger video pipeline:', failure)
    await Post.findByIdAndUpdate(input.postId, {
      $set: { 'moderationMeta.pipelineError': failure }
    }).catch(() => undefined)
  }
}
