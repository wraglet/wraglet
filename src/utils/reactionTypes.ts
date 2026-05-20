export const REACTION_TYPES = [
  'like',
  'love',
  'haha',
  'wow',
  'sad',
  'angry'
] as const

export type ReactionType = (typeof REACTION_TYPES)[number]

export const normalizeReactionType = (value: unknown): ReactionType | null => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return REACTION_TYPES.includes(normalized as ReactionType)
    ? (normalized as ReactionType)
    : null
}
