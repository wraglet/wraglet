# Wraglet moderation thresholds

Documented defaults for image frame scoring and aggregated video frame scores.

## Environments

| Setting                                            | Local (`.env.local`) | Staging (Vercel Preview, `staging` branch)        | Production (Vercel Production)                    |
| -------------------------------------------------- | -------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `MODERATION_AUTO_APPROVE_IMAGES`                   | `true`               | `false`                                           | `false`                                           |
| `MODERATION_WORKER_URL`                            | unset                | `wraglet-moderation-image-staging` Worker         | `wraglet-moderation-image` Worker                 |
| `VIDEO_WORKER_URL`                                 | unset                | `wraglet-video-pipeline-staging` Worker           | `wraglet-video-pipeline` Worker                   |
| `MODERATION_WORKER_SECRET` / `VIDEO_WORKER_SECRET` | any long random      | unique per env; same value as the Wrangler secret | unique per env; same value as the Wrangler secret |
| R2 bucket the Workers read/write                   | —                    | `wraglet-users-staging`                           | `wraglet-users`                                   |
| Cloudflare Queue                                   | —                    | `wraglet-video-pipeline-staging`                  | `wraglet-video-pipeline`                          |

When worker URLs are unset, wraglet **auto-approves** validated images and copies uploaded videos to `videos/{postId}/master.mp4` so the feed works without Cloudflare Workers.

Both Workers live under the `admin@wraglet.com` Cloudflare account (`account_id` is pinned in each `wrangler.toml`). Deploy with:

```
cd workers/moderation-image && yarn wrangler deploy --env=""        # production
cd workers/moderation-image && yarn wrangler deploy --env staging   # staging
```

Secrets: `printf '%s' "$SECRET" | yarn wrangler secret put MODERATION_WORKER_SECRET [--env staging]` (and `VIDEO_WORKER_SECRET` for the video Worker). The same value must be set in Vercel for the matching environment.

## How classification works

Both Workers call **Cloudflare Workers AI** with the Clef decision model (`@cf/cloudflare/clef`, binding `AI`); no third-party vendor or extra account is involved. Shared logic is in `workers/shared/nsfw.ts`.

Clef is asked five yes/no questions per image (probabilities 0..1): `explicit`, `suggestive`, `drawn`, `gore`, `minor_sexual`. They are mapped to the app's score shape:

| Score         | Derived from                                        |
| ------------- | --------------------------------------------------- |
| `Porn`        | `explicit × (1 − drawn)`                            |
| `Hentai`      | `explicit × drawn`                                  |
| `Sexy`        | `suggestive`                                        |
| `Drawing`     | `drawn`                                             |
| `Gore`        | `gore`                                              |
| `MinorSexual` | `minor_sexual`                                      |
| `Neutral`     | `1 − max(explicit, suggestive, gore, minor_sexual)` |

For videos, frames are sampled every 5 s (min 4, max 12) via the **Media Transformations** binding (`MEDIA`), classified in batches of 4, and signals are merged with element-wise max (one bad frame fails the video).

Any classifier failure (binding missing, inference error, unsupported format, image > 4 MiB) **fails closed** to `review`, so the post lands in `needs_review` instead of being silently approved.

Worker env knobs:

- `NSFW_MODEL` — `@cf/cloudflare/clef` (default, 27B) or set the selector to `clef-flash` for the cheaper 9B model.
- `TEST_NSFW_EXPLICIT_SCORE` — when set, skips the model and returns a synthetic score. Ignored whenever `ENVIRONMENT=production`, so it cannot be used to bypass the model in prod even if set by mistake.
- `ENVIRONMENT` — `production` / `staging` / `development`; gates the test override above.
- `ALLOWED_CALLBACK_HOSTS` — comma-separated hostnames the Workers may call back (`www.wraglet.com,wraglet.com` in prod, `staging.wraglet.com` on staging). Any other `callbackUrl` is rejected with 400 (SSRF guard). Unset = any `https://` host (local only).

Worker request hardening (`workers/shared/security.ts`): bearer secrets are compared with `crypto.subtle.timingSafeEqual`; `key` must start with `quarantine/` (no `..`, `//`, `\`); `postId` must be a 24-hex ObjectId.

## Decision resolution (app side)

The Worker's `decision` is **advisory**. Both webhooks (`/api/moderation/image-complete`, `/video-complete`) recompute the decision from `scores` with `resolveWebhookDecision()` (`src/lib/moderation/nsfwDecision.ts`) and take the **stricter** of the two; an empty/absent score object resolves to `review`. A compromised or buggy Worker can therefore make the app stricter, never more lenient.

Webhooks are idempotent: the quarantine key must still be the post's `moderationMeta.pendingImageKey` / `pendingVideoKey` (or the user's `pendingMedia.*Key`) and the post must still be `pending`; otherwise the request is acknowledged (`{ success: true, alreadyProcessed: true }`) with no storage or document changes. `video.key`/`posterKey` must sit under `videos/{postId}/`; public URLs are derived from `NEXT_PUBLIC_R2_USERS_URL`, never taken from the payload.

Blog images have no document to update asynchronously, so `/api/blogs/upload-image` calls the image Worker **synchronously** (`moderateQuarantinedImageSync`) and only returns a URL for `approve`; anything else deletes the quarantine object and returns 422.

## NSFW score tiers

Combined explicit score:

```
explicit = Porn + Hentai + (Sexy * 0.5)
risk     = max(explicit, Gore)
```

| Risk                  | Action                                        | Feed visibility (default) |
| --------------------- | --------------------------------------------- | ------------------------- |
| `MinorSexual` >= 0.50 | Auto-reject (hard rule, ignores other scores) | Hidden                    |
| >= 0.85               | Auto-reject                                   | Hidden                    |
| 0.50 – 0.85           | Auto-approve + `needs_review`                 | Visible                   |
| < 0.50                | Auto-approve                                  | Visible                   |

Environment overrides (set in Worker `[vars]` **and** Vercel so both sides agree):

- `MODERATION_NSFW_REJECT_THRESHOLD` (default `0.85`)
- `MODERATION_NSFW_REVIEW_THRESHOLD` (default `0.50`)
- `MODERATION_STRICT_GRAY=true` keeps gray-zone content `pending` (hidden) until manual admin approval

Observed on staging with real Clef: landscape → approve (Neutral 0.95); cartoon → approve; classical nude painting → reject (explicit 1.11); bikini beach photo → review (Sexy 0.80 → 0.52). If swimwear lands in review too often, raise the review threshold to ~0.60.

## Video limits

- Containers: MP4 / MOV only (`video/mp4`, `video/quicktime`). WebM is not accepted because the duration probe and Media Transformations only handle ISO BMFF.
- Max duration: 600 seconds (10 minutes)
- Max raw upload: 200 MB
- Per-user quota: 5 videos / day, 500 MB / day — counted per **upload session** (`moderationMeta.rawBytes`), so abandoned/rejected uploads still consume quota.
- Multipart parts: ≤ 4 MiB each, part number ≤ ceil(declared size / 4 MiB); the key must be the one issued by `/upload-session` for that post.

## Video pipeline

1. `POST /api/posts/video/upload-session` reserves a `pending` post + multipart upload; `/upload-part` streams chunks; `POST /api/posts/video/complete` finalises and (inside `after()`) calls the Worker `/process-video`, which enqueues the job and returns `202 { queued: true }`. A failed hand-off is recorded in `moderationMeta.pipelineError`.
2. Queue consumer (`max_retries = 3`, 30 s × attempt backoff):
   - `head()` the quarantine object (missing → `rejectedReason: 'format'`).
   - Probe the real duration from `moov/mvhd` with R2 range reads (`workers/shared/mp4.ts`). Unparseable container → `format`; duration over the limit → `duration`. The client-asserted duration is only logged (`video_duration_mismatch`) when it disagrees by more than 2 s.
   - Extract frames at 720px + a full-res poster via `MEDIA`.
   - Classify. Reject → callback with `decision: 'reject'`, quarantine object is deleted by the app.
   - Otherwise write `videos/{postId}/poster.jpg`; if duration ≤ 60 s transcode a 1280×720 `master.mp4` via `MEDIA`, else stream-copy the original.
3. Callback `POST /api/moderation/video-complete` with `scores`, `decision`, `video {url, posterUrl, durationSec, width, height}`.
4. After the final failed attempt the Worker calls back with `decision: 'review'` and **no** `quarantineKey`, so the source is kept for manual handling.

Media Transformations limits: input ≤ 100 MB, output video ≤ 60 s (longer videos keep the original file and only get a poster + classification).

## Workers

- `workers/moderation-image/` — quarantined still image scan (`POST /moderate-image`, synchronous)
- `workers/video-pipeline/` — queue-backed frame sampling, classification, poster + 720p transcode
- `workers/shared/nsfw.ts` — Clef prompt, score mapping, decision rules (unit-tested in `nsfw.test.ts`)
- `workers/shared/security.ts` — timing-safe bearer check, quarantine-key / ObjectId / callback-host validation
- `workers/shared/mp4.ts` — ISO BMFF box walker + `mvhd` duration probe

## Known follow-ups

- R2 lifecycle rules: expire `quarantine/*` objects (e.g. 7 days) and abort incomplete multipart uploads (e.g. 1 day) so abandoned sessions don't accumulate.
- Orphaned `pending` posts (client died before `/complete`, or Worker never called back) need a sweeper or an admin view keyed on `moderationMeta.pipelineError` / age.
- Daily video quota is an atomic reservation on the user (`videoUploadUsage`, tumbling 24h window). A session that fails before the post is created releases the reservation.

## Tuning notes

1. Start with defaults above on staging.
2. Track false positives in admin `/reports` and `needs_review` queue.
3. Lower review threshold only if explicit content slips through user reports.
4. Raise review threshold if beach/gym/memes are over-flagged for review; raise reject threshold only if clearly safe content is being removed.
5. Cost: Workers AI free tier is 10k neurons/day; beyond that Workers Paid ($5/mo) applies. Clef is billed per input token (~$0.24/M for 27B, ~$0.038/M for `clef-flash`).
