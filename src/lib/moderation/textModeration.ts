import { CUSTOM_BLOCKLIST, TEXT_ALLOWLIST } from '@/lib/moderation/constants'
import { normalizeText } from '@/lib/moderation/normalizeText'
import { Filter } from 'bad-words'

let filter: Filter | null = null

const getFilter = (): Filter => {
  if (!filter) {
    filter = new Filter()
    filter.addWords(...CUSTOM_BLOCKLIST)
    filter.removeWords(...TEXT_ALLOWLIST)
  }
  return filter
}

const isAllowlisted = (normalized: string): boolean =>
  TEXT_ALLOWLIST.some((term) => normalized.includes(term))

const containsCustomBlockedTerm = (normalized: string): boolean =>
  CUSTOM_BLOCKLIST.some((term) =>
    new RegExp(
      `(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`
    ).test(normalized)
  )

const matchesProfanityDictionary = (value: string): boolean => {
  const profanityFilter = getFilter()

  if (!value.includes(' ')) {
    return profanityFilter.isProfane(value)
  }

  return value
    .split(' ')
    .some((token) => token.length > 0 && profanityFilter.isProfane(token))
}

export const containsProfanity = (text: string): boolean => {
  if (!text?.trim()) {
    return false
  }

  const normalized = normalizeText(text)
  if (!normalized) {
    return false
  }

  if (isAllowlisted(normalized)) {
    return false
  }

  if (containsCustomBlockedTerm(normalized)) {
    return true
  }

  return matchesProfanityDictionary(normalized)
}
