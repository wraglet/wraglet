import RateLimit, { type IRateLimit } from '@/models/RateLimit'

type RateLimitLean = Pick<IRateLimit, 'count' | 'windowStartMs'>

type RateLimitEntry = {
  count: number
  windowStartMs: number
}

const PRUNE_INTERVAL_MS = 60_000
const MAX_STORE_ENTRIES = 10_000

type RateLimitGlobal = typeof globalThis & {
  __wragletRateLimitStore?: Map<string, RateLimitEntry>
  __wragletRateLimitLastPrune?: number
}

const globalStore = globalThis as RateLimitGlobal

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

/** Vitest and local unit tests use in-memory limits (no Mongo writes). */
export const shouldUseMemoryRateLimit = (): boolean =>
  process.env.NODE_ENV === 'test' ||
  process.env.VITEST === 'true' ||
  process.env.RATE_LIMIT_MEMORY === 'true' ||
  process.env.RATE_LIMIT_MEMORY === '1'

const getMemoryStore = (): Map<string, RateLimitEntry> => {
  globalStore.__wragletRateLimitStore ??= new Map()
  return globalStore.__wragletRateLimitStore
}

const pruneExpiredEntries = (now: number, maxWindowMs: number): void => {
  const store = getMemoryStore()
  for (const [key, entry] of store) {
    if (now - entry.windowStartMs >= maxWindowMs) {
      store.delete(key)
    }
  }
}

const maybePruneMemory = (now: number, windowMs: number): void => {
  const store = getMemoryStore()
  const last = globalStore.__wragletRateLimitLastPrune ?? 0
  if (store.size > MAX_STORE_ENTRIES || now - last >= PRUNE_INTERVAL_MS) {
    pruneExpiredEntries(now, windowMs)
    globalStore.__wragletRateLimitLastPrune = now
  }
}

const checkRateLimitMemory = (
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult => {
  const now = Date.now()
  maybePruneMemory(now, windowMs)

  const store = getMemoryStore()
  const entry = store.get(key)

  if (!entry || now - entry.windowStartMs >= windowMs) {
    store.set(key, { count: 1, windowStartMs: now })
    return { allowed: true }
  }

  if (entry.count < maxAttempts) {
    entry.count += 1
    return { allowed: true }
  }

  const retryAfterSeconds = Math.ceil(
    (windowMs - (now - entry.windowStartMs)) / 1000
  )
  return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) }
}

const checkRateLimitMongo = async (
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> => {
  const now = Date.now()
  const expiresAt = new Date(now + windowMs)

  const existing = await RateLimit.findOne({ key }).lean<RateLimitLean | null>()

  if (!existing || now - existing.windowStartMs >= windowMs) {
    await RateLimit.findOneAndUpdate(
      { key },
      { $set: { count: 1, windowStartMs: now, expiresAt } },
      { upsert: true }
    )
    return { allowed: true }
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil(
      (windowMs - (now - existing.windowStartMs)) / 1000
    )
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) }
  }

  const updated = await RateLimit.findOneAndUpdate(
    {
      key,
      windowStartMs: existing.windowStartMs,
      count: existing.count
    },
    { $inc: { count: 1 } },
    { new: true }
  ).lean<RateLimitLean | null>()

  if (!updated) {
    return checkRateLimitMongo(key, maxAttempts, windowMs)
  }

  if (updated.count > maxAttempts) {
    const retryAfterSeconds = Math.ceil(
      (windowMs - (now - updated.windowStartMs)) / 1000
    )
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) }
  }

  return { allowed: true }
}

/**
 * Sliding-window rate limiter.
 * Production: MongoDB (shared across Vercel instances). Tests: in-memory.
 */
export const checkRateLimit = async (
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> => {
  if (shouldUseMemoryRateLimit()) {
    return checkRateLimitMemory(key, maxAttempts, windowMs)
  }

  try {
    return await checkRateLimitMongo(key, maxAttempts, windowMs)
  } catch (error) {
    console.error('[rateLimit] Mongo check failed', error)
    if (process.env.NODE_ENV === 'production') {
      return { allowed: false, retryAfterSeconds: 60 }
    }
    return { allowed: true }
  }
}

/** @internal — reset in-memory store between tests */
export const _resetRateLimitStoreForTests = (): void => {
  getMemoryStore().clear()
  globalStore.__wragletRateLimitLastPrune = 0
}
