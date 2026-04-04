import type { IPost } from '@/models/Post'

export const isPopulatedPostAuthor = (author: unknown): boolean => {
  if (!author || typeof author !== 'object') return false
  const a = author as Record<string, unknown>
  return Boolean(a.firstName || a.lastName || a.username)
}

/**
 * Merges a realtime/API patch into local post state without dropping a populated author
 * when the patch only carries an id, null, or a partial document.
 */
export const mergePostClientUpdate = (
  prev: IPost,
  patch: Partial<IPost> | IPost
): IPost => {
  const next = { ...prev, ...patch } as IPost
  if (
    isPopulatedPostAuthor(prev.author) &&
    !isPopulatedPostAuthor(next.author)
  ) {
    next.author = prev.author
  }
  const patchAuthor = (patch as Partial<IPost>).author
  if (
    typeof patchAuthor === 'string' &&
    isPopulatedPostAuthor(prev.author) &&
    String((prev.author as { _id: string })._id) === patchAuthor
  ) {
    next.author = prev.author
  }
  return next
}

/**
 * Merges feed prop updates (e.g. React Query) into local state, preferring a populated author.
 */
export const mergePostFromFeedProp = (prev: IPost, incoming: IPost): IPost => {
  const next = { ...prev, ...incoming } as IPost
  const incOk = isPopulatedPostAuthor(incoming.author)
  const prevOk = isPopulatedPostAuthor(prev.author)
  if (incOk) {
    next.author = incoming.author
  } else if (prevOk) {
    next.author = prev.author
  }
  return next
}
