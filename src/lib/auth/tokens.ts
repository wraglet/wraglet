import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const TOKEN_BYTES = 32

/** URL-safe opaque token for verify/reset links. */
export const generateAuthToken = (): string =>
  randomBytes(TOKEN_BYTES).toString('base64url')

export const hashAuthToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex')

export const verifyAuthToken = (
  token: string,
  storedHash: string | undefined | null
): boolean => {
  if (!token || !storedHash) return false
  const candidate = hashAuthToken(token)
  if (candidate.length !== storedHash.length) return false
  try {
    return timingSafeEqual(
      Buffer.from(candidate, 'utf8'),
      Buffer.from(storedHash, 'utf8')
    )
  } catch {
    return false
  }
}
