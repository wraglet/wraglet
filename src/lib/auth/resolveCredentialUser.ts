import { canonicalizeEmail } from '@/lib/trust/validateEmail'
import User, { type IUserDocument } from '@/models/User'
import type { Types } from 'mongoose'

export type UserWithId = IUserDocument & {
  _id: Types.ObjectId
}

export const buildCredentialSearchQuery = (
  emailOrUsername: string
): Record<string, unknown> => {
  const normalized = emailOrUsername.trim().toLowerCase()
  const isEmail =
    normalized.includes('@') &&
    !normalized.startsWith('@') &&
    normalized.includes('.')

  if (isEmail) {
    const canonical = canonicalizeEmail(normalized)
    return {
      $or: [{ email: normalized }, { canonicalEmail: canonical }]
    }
  }

  const username = normalized.startsWith('@') ? normalized : `@${normalized}`
  return { username }
}

export const findUserByCredential = async (
  emailOrUsername: string
): Promise<UserWithId | null> => {
  const query = buildCredentialSearchQuery(emailOrUsername)
  return User.findOne(query).lean() as Promise<UserWithId | null>
}
