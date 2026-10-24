const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g

const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's'
}

/** Collapse repeated characters (e.g. fuuuu -> fuu). */
const collapseRepeated = (value: string): string =>
  value.replace(/(.)\1{2,}/g, '$1$1')

export const normalizeText = (text: string): string => {
  let normalized = text.toLowerCase().replace(ZERO_WIDTH, '')

  normalized = normalized
    .split('')
    .map((char) => LEET_MAP[char] ?? char)
    .join('')

  normalized = collapseRepeated(normalized)
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ')
  normalized = normalized.replace(/\s+/g, ' ').trim()

  return normalized
}
