'use client'

import { useEffect, useRef, useState } from 'react'
import type { PublicUser } from '@/interfaces'
import type { IBlog } from '@/models/Blog'
import {
  arrow,
  flip,
  FloatingArrow,
  offset,
  shift,
  useFloating
} from '@floating-ui/react'
import { useChannel } from 'ably/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaRegHeart } from 'react-icons/fa6'

import ReactionIcon from '@/components/shared/ReactionIcon'

interface BlogReactionControlsProps {
  blog: IBlog
  currentUser: PublicUser | null
  onBlogUpdated: (blog: IBlog) => void
}

const REACTION_NAMES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const

const BlogReactionControls = ({
  blog,
  currentUser,
  onBlogUpdated
}: BlogReactionControlsProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const { publish } = useChannel(`blog-${blog._id}`, () => {})

  const [showEmojis, setShowEmojis] = useState(false)
  const arrowRef = useRef(null)
  const { refs, floatingStyles, context } = useFloating({
    open: showEmojis,
    onOpenChange: setShowEmojis,
    middleware: [
      offset(10),
      flip({ padding: 10 }),
      shift(),
      arrow({ element: arrowRef })
    ],
    placement: 'top'
  })

  const reactionCount = blog.reactions?.length ?? 0
  const displayCount = reactionCount > 0 ? reactionCount : (blog.likes ?? 0)

  const userReaction = blog.reactions?.find(
    (reaction) => reaction.userId?._id === currentUser?._id
  )

  const removeReaction = async () => {
    if (!currentUser) return
    try {
      const response = await axios.delete(`/api/blogs/${blog.slug}/react`)
      if (response.status !== 200) throw new Error('Failed to remove reaction')
      onBlogUpdated(response.data as IBlog)
      await publish?.({
        name: 'reaction',
        data: { blog: response.data }
      })
    } catch (error) {
      console.error('Error removing blog reaction:', error)
      toast.error('Failed to remove reaction')
    }
  }

  const applyReaction = async (type: string) => {
    if (!currentUser) {
      toast.error('Please log in to react to this blog')
      return
    }
    try {
      const existing = blog.reactions?.find(
        (r) => r.userId?._id === currentUser._id && r.type === type
      )

      if (existing) {
        await removeReaction()
        return
      }

      const response = await axios.patch(`/api/blogs/${blog.slug}/react`, {
        type
      })
      if (response.status !== 200) throw new Error('Failed to update reaction')
      onBlogUpdated(response.data as IBlog)
      await publish?.({
        name: 'reaction',
        data: { blog: response.data }
      })
    } catch (error) {
      console.error('Error updating blog reaction:', error)
      toast.error('Failed to update reaction')
    }
  }

  const handleToggleEmojis = () => {
    if (!currentUser) {
      toast.error('Please log in to react to this blog')
      return
    }
    setShowEmojis((open) => !open)
  }

  const disabledClass = currentUser ? '' : 'cursor-not-allowed opacity-50'

  return (
    <div className="group relative">
      <div className={`flex items-center gap-1 ${disabledClass}`}>
        {userReaction ? (
          <button
            type="button"
            className="flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-red-600 hover:bg-red-100"
            aria-label={`Remove ${userReaction.type} reaction`}
            onClick={() => {
              removeReaction().catch(() => {})
            }}
          >
            <ReactionIcon type={userReaction.type} />
          </button>
        ) : null}
        <button
          type="button"
          ref={refs.setReference}
          disabled={!currentUser}
          onClick={handleToggleEmojis}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            userReaction
              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={userReaction ? 'Change reaction' : 'Add reaction'}
        >
          {userReaction ? null : <FaRegHeart className="h-3.5 w-3.5" />}
          <span className="font-medium">{displayCount}</span>
        </button>
      </div>

      {showEmojis && currentUser && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 flex w-fit gap-1 rounded-lg border border-solid border-gray-200 bg-white p-2 shadow-lg"
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className="fill-white"
          />
          {REACTION_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => {
                applyReaction(name).catch(() => {})
                setShowEmojis(false)
              }}
            >
              {/* @ts-ignore — custom element */}
              <lottie-player
                id={`blog-reaction-${name}-${blog._id}`}
                autoplay
                loop
                mode="normal"
                src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/lottie/${name}.json`}
                style={{ width: '24px', height: '24px' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogReactionControls
