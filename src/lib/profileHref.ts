export const profileHrefFromUsername = (
  username: string | null | undefined
): `/${string}` | null => {
  if (username == null || typeof username !== 'string') return null
  const trimmed = username.trim()
  return trimmed.length > 0 ? `/${trimmed}` : null
}

/** One `@` prefix for handles in the UI; DB stores `username` with a leading `@`. */
export const usernameToDisplayHandle = (
  username: string | null | undefined
): string => {
  if (username == null || typeof username !== 'string') return ''
  const t = username.trim()
  if (!t) return ''
  return t.startsWith('@') ? t : `@${t}`
}
