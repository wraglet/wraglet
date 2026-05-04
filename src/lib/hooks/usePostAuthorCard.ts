import { useFollow } from '@/lib/hooks/useFollow'
import { profileHrefFromUsername } from '@/lib/profileHref'
import type { IPost } from '@/models/Post'
import type { User } from '@/store/user'
import {
  getAuthorDisplayName,
  getAuthorProfileHref,
  getIsPostAuthor,
  getPostAuthorId
} from '@/utils/postAuthorCard'

export const usePostAuthorCard = (post: IPost, currentUser: User | null) => {
  const author = post.author
  const authorId = getPostAuthorId(author)
  const isAuthor = getIsPostAuthor(currentUser?._id, authorId)
  const { isFollowing, follow: followMutate, loading } = useFollow(authorId)

  const follow = () => {
    followMutate()
  }

  const currentUserProfileHref = currentUser?.username
    ? profileHrefFromUsername(currentUser.username)
    : null

  return {
    authorId,
    authorProfileHref: getAuthorProfileHref(author),
    authorDisplayName: getAuthorDisplayName(author),
    isAuthor,
    isFollowing,
    follow,
    loading,
    currentUserProfileHref
  }
}
