'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { IPost } from '@/models/Post'
import { IShare } from '@/models/Share'
import { ChannelProvider } from 'ably/react'
import { formatDistanceToNow } from 'date-fns'
import { HiDotsHorizontal } from 'react-icons/hi'

import Avatar from '@/components/Avatar'
import PostImages from '@/components/PostImages'
import PostInteractions from '@/components/PostInteractions'

const ShareModalWithAbly = dynamic(
  () => import('@/components/ShareModalWithAbly'),
  {
    ssr: false
  }
)

interface ShareContentProps {
  share: IShare & {
    originalPost: IPost
    sharedBy: {
      _id: string
      firstName: string
      lastName: string
      username: string
      gender?: string
      profilePicture?: {
        url: string
      } | null
    }
  }
}

const ShareContent = ({ share }: ShareContentProps) => {
  // Transform share to look like a post for interactions
  const shareAsPost = {
    ...share,
    _id: share._id,
    content: share.originalPost.content,
    author: share.originalPost.author,
    audience: share.originalPost.audience,
    // Use share's own reactions and comments, not original post's
    reactions: share.reactions || [],
    comments: share.comments || [],
    votes: (share.votes || []).map((vote) => ({
      ...vote,
      createdAt: vote.createdAt || new Date(),
      updatedAt: vote.updatedAt || new Date()
    })),
    createdAt: share.createdAt || share.originalPost.createdAt,
    updatedAt: share.updatedAt || share.originalPost.updatedAt,
    // Add originalPost property to identify this as a share
    originalPost: share.originalPost
  }

  return (
    <>
      <div className="px-4 py-3">
        {/* Original Post Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${share.originalPost.author.username}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Avatar
                gender={share.originalPost.author?.gender}
                src={share.originalPost.author.profilePicture?.url || null}
                size="h-8 w-8"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {share.originalPost.author.firstName}{' '}
                  {share.originalPost.author.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {share.originalPost.createdAt &&
                    formatDistanceToNow(
                      new Date(share.originalPost.createdAt),
                      {
                        addSuffix: true
                      }
                    )}
                </p>
              </div>
            </Link>
          </div>
          <button className="rounded-full p-1 hover:bg-gray-100">
            <HiDotsHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Original Post Content */}
        {share.originalPost.content.text && (
          <div className="mb-3">
            <p className="text-gray-900">{share.originalPost.content.text}</p>
          </div>
        )}

        {/* Original Post Images */}
        {share.originalPost.content.images &&
          share.originalPost.content.images.length > 0 && (
            <div className="mb-3">
              <PostImages images={share.originalPost.content.images} />
            </div>
          )}

        {/* Share Stats - moved to PostInteractions */}
      </div>

      {/* Share's Own Interactions (separate from original post) */}
      <ChannelProvider channelName={`post-${share._id}`}>
        <PostInteractions post={shareAsPost} />
      </ChannelProvider>
    </>
  )
}

export default ShareContent
