import type { IPost } from '@/models/Post'
import type { IShare } from '@/models/Share'

/** Share + populated `originalPost` as rendered in `ShareContent` / `SharedPost`. */
export type ShareWithOriginalPost = Omit<IShare, 'originalPost'> & {
  originalPost: IPost
}

/**
 * Shape passed into `PostInteractions` for a share card. **Uses the share `_id`** so
 * react/vote/comment URLs target `/api/shares/...`, not the original post id (plan §6.7).
 */
export const buildShareAsPost = (share: ShareWithOriginalPost) => ({
  ...share,
  _id: share._id,
  content: share.originalPost.content,
  author: share.originalPost.author,
  audience: share.originalPost.audience,
  reactions: share.reactions || [],
  comments: share.comments || [],
  votes: (share.votes || []).map((vote) => ({
    ...vote,
    createdAt: vote.createdAt || new Date(),
    updatedAt: vote.updatedAt || new Date()
  })),
  createdAt: share.createdAt || share.originalPost.createdAt,
  updatedAt: share.updatedAt || share.originalPost.updatedAt,
  originalPost: share.originalPost
})
