import {
  canonicalizeEmail,
  normalizeEmailInput
} from '@/lib/trust/validateEmail'
import User, { type IUserDocument } from '@/models/User'
import type { Types } from 'mongoose'

export type UserEmailLookup = IUserDocument & {
  _id: Types.ObjectId
}

/** Find by stored email or canonical form (Gmail dot-alias safe). */
export const findUserByEmail = async (
  rawEmail: string
): Promise<UserEmailLookup | null> => {
  const normalized = normalizeEmailInput(rawEmail)
  const canonical = canonicalizeEmail(normalized)
  return User.findOne({
    $or: [{ email: normalized }, { canonicalEmail: canonical }]
  }) as Promise<UserEmailLookup | null>
}
