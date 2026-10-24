import type { IPost } from '@/models/Post'

interface PostModerationStatusProps {
  post: IPost
}

const PostModerationStatus = ({ post }: PostModerationStatusProps) => {
  if (post.moderationStatus === 'pending') {
    return (
      <div
        className="my-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        role="status"
      >
        Processing your image…
      </div>
    )
  }

  if (post.moderationStatus === 'rejected') {
    return (
      <div
        className="my-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        role="alert"
      >
        Couldn&apos;t publish — content violates community guidelines.
      </div>
    )
  }

  return null
}

export default PostModerationStatus
