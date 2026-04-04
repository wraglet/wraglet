/** Escape a string for safe use inside a RegExp (MongoDB $regex). */
export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
