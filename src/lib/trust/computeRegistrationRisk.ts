import {
  getEmailDomain,
  gmailDotCount,
  isDisposableEmailDomain
} from '@/lib/trust/validateEmail'
import { validateHumanName } from '@/lib/trust/validateHumanName'

export type RegistrationRiskInput = {
  firstName: string
  lastName: string
  email: string
  emailVerifiedAt?: Date | null
  accountStatus?: string | null
  createdAt?: Date | null
  postCount?: number
  followCount?: number
  usernameChanged?: boolean
}

/** 0–100 score for admin cleanup sorting (see planning/REGISTRATION_TRUST.md). */
export const computeRegistrationRisk = (
  input: RegistrationRiskInput
): number => {
  let score = 0

  const nameCheck = validateHumanName(input.firstName, input.lastName)
  if (!nameCheck.valid) score += 40

  const dots = gmailDotCount(input.email)
  if (dots >= 4) score += 25

  const domain = getEmailDomain(input.email)
  if (isDisposableEmailDomain(domain)) score += 50

  if (!input.emailVerifiedAt) score += 30

  const ageMs = input.createdAt
    ? Date.now() - input.createdAt.getTime()
    : Number.POSITIVE_INFINITY
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (
    (input.postCount ?? 0) === 0 &&
    (input.followCount ?? 0) === 0 &&
    ageDays < 30
  ) {
    score += 10
  }

  if (
    input.accountStatus === 'pending_verification' &&
    ageDays > 7 &&
    !input.emailVerifiedAt
  ) {
    score += 20
  }

  if (!input.usernameChanged) score += 5

  return Math.min(100, score)
}
