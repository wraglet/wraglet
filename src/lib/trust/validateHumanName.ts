const NAME_MIN = 2
const NAME_MAX = 50
const MAX_REPEAT_CHAR = 4
const ENTROPY_THRESHOLD = 4.2

const BLOCKLIST = new Set([
  'test',
  'asdf',
  'null',
  'undefined',
  'admin',
  'user',
  'guest'
])

const VOWELS = /[aeiouy]/i
const LATIN_LETTERS = /[a-z]/i
const ALLOWED_NAME = /^[\p{L}\p{M}'\-\s]+$/u
const DIGIT_OR_URL = /(\d{3,}|https?:|www\.|@)/i

const shannonEntropy = (value: string): number => {
  if (value.length === 0) return 0
  const freq = new Map<string, number>()
  for (const ch of value) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1)
  }
  let entropy = 0
  for (const count of freq.values()) {
    const p = count / value.length
    entropy -= p * Math.log2(p)
  }
  return entropy
}

const hasRepeatedCharSpam = (value: string): boolean => {
  let run = 1
  for (let i = 1; i < value.length; i++) {
    run = value[i] === value[i - 1] ? run + 1 : 1
    if (run > MAX_REPEAT_CHAR) return true
  }
  return false
}

const failsLatinVowelHeuristic = (part: string): boolean => {
  if (!LATIN_LETTERS.test(part)) return false
  return !VOWELS.test(part)
}

export type HumanNameValidationResult =
  | { valid: true }
  | { valid: false; reason: string }

export const validateHumanNamePart = (
  part: string,
  label: 'First name' | 'Last name'
): HumanNameValidationResult => {
  const trimmed = part.trim()
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    return {
      valid: false,
      reason: `${label} must be between ${NAME_MIN} and ${NAME_MAX} characters`
    }
  }

  if (!ALLOWED_NAME.test(trimmed)) {
    return {
      valid: false,
      reason: `${label} may only contain letters, spaces, hyphens, and apostrophes`
    }
  }

  if (DIGIT_OR_URL.test(trimmed)) {
    return { valid: false, reason: `${label} looks invalid` }
  }

  if (BLOCKLIST.has(trimmed.toLowerCase()) || trimmed.length === 1) {
    return { valid: false, reason: `${label} is not allowed` }
  }

  if (hasRepeatedCharSpam(trimmed)) {
    return { valid: false, reason: `${label} looks invalid` }
  }

  if (shannonEntropy(trimmed) > ENTROPY_THRESHOLD) {
    return { valid: false, reason: `${label} looks invalid` }
  }

  if (failsLatinVowelHeuristic(trimmed)) {
    return { valid: false, reason: `${label} looks invalid` }
  }

  return { valid: true }
}

export const validateHumanName = (
  firstName: string,
  lastName: string
): HumanNameValidationResult => {
  const first = validateHumanNamePart(firstName, 'First name')
  if (!first.valid) return first
  return validateHumanNamePart(lastName, 'Last name')
}
