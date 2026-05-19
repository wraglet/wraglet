export const formatDisplayUsername = (
  username: string | undefined | null
): string => {
  if (!username) return ''
  return username.startsWith('@') ? username : `@${username}`
}

export const formatSearchUserSubtitle = (
  username: string,
  bio?: string | null
): string => {
  if (!bio) return username
  const bioPreview = bio.length > 50 ? `${bio.slice(0, 50)}...` : bio
  return `${username} • ${bioPreview}`
}

export const getFollowButtonLabel = (
  isFollowing: boolean,
  loading: boolean
): string => {
  if (isFollowing) return 'Following'
  if (loading) return 'Following...'
  return 'Follow'
}

export const getNavItemRadiusClass = (
  isFirst: boolean,
  isLast: boolean
): string => {
  if (isFirst) return 'rounded-t-lg'
  if (isLast) return 'rounded-b-lg'
  return ''
}

export const getStackedAvatarPositionClass = (
  index: number,
  variant: 'sm' | 'md' = 'md'
): string => {
  if (index === 0) return 'top-0 left-0 z-30'
  if (index === 1) {
    return variant === 'sm' ? 'top-0 left-4 z-20' : 'top-0 left-5 z-20'
  }
  return variant === 'sm' ? 'top-4 left-2 z-10' : 'top-5 left-2 z-10'
}

export const getBlogUpdateButtonLabel = (
  isLoading: boolean,
  status: string
): string => {
  if (isLoading) return 'Updating...'
  if (status === 'published') return 'Update & Publish'
  return 'Update Draft'
}

export const isNavigatorShareCancelled = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError'

export const formatUserPhotoAlt = (
  firstName: string,
  lastName?: string | null
): string => {
  const name = lastName ? `${firstName} ${lastName}` : firstName
  return `${name}'s photo`
}
