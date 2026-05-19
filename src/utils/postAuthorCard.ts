import { profileHrefFromUsername } from '@/lib/profileHref'
import type { IPost } from '@/models/Post'

/** Author on a post may be a populated user, a raw ObjectId string from JSON, or legacy string id. */
type PostAuthorInput = IPost['author'] | string | null | undefined

export const getPostAuthorId = (author: PostAuthorInput): string | null => {
  if (typeof author === 'string' && author) {
    return author
  }
  if (
    author &&
    typeof author === 'object' &&
    '_id' in author &&
    author._id != null
  ) {
    return String(author._id)
  }
  return null
}

export const getIsPostAuthor = (
  currentUserId: string | undefined,
  authorId: string | null
): boolean => {
  return !!(currentUserId && authorId && String(currentUserId) === authorId)
}

export const getAuthorProfileHref = (
  author: PostAuthorInput
): string | null => {
  if (
    author &&
    typeof author === 'object' &&
    'username' in author &&
    author.username
  ) {
    return profileHrefFromUsername(author.username)
  }
  return null
}

export const getAuthorDisplayName = (author: PostAuthorInput): string => {
  if (author && typeof author === 'object') {
    return (
      [author.firstName, author.lastName].filter(Boolean).join(' ') ||
      'Unknown user'
    )
  }
  return 'Unknown user'
}
