'use client'

/* Floating UI passes ref objects to middleware and uses ref callbacks on the floating node; this is the supported integration pattern. */
/* eslint-disable react-hooks/refs */
import { useRef, useState } from 'react'
import {
  arrow,
  flip,
  FloatingArrow,
  offset,
  shift,
  useFloating
} from '@floating-ui/react'
import { FaRegHeart } from 'react-icons/fa6'

import Button from '@/components/shared/Button'
import ReactionIcon from '@/components/shared/ReactionIcon'

const REACTION_NAMES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const

interface PostReactionControlProps {
  postId: string
  userReaction?: { type: string }
  onReact: (type: string) => void
  onRemoveReaction: () => void
}

const PostReactionControl = ({
  postId,
  userReaction,
  onReact,
  onRemoveReaction
}: PostReactionControlProps) => {
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

  const handleReactionClick = () => {
    setShowEmojis((open) => !open)
  }

  return (
    <div className="group relative">
      <button
        type="button"
        ref={refs.setReference}
        className="flex items-center gap-1 rounded-full border border-solid border-gray-400 px-2 py-0.5"
        onClick={handleReactionClick}
      >
        {userReaction ? (
          <ReactionIcon
            type={userReaction.type}
            onClick={async () => {
              await onRemoveReaction()
            }}
          />
        ) : (
          <FaRegHeart className="cursor-pointer text-xs text-gray-600" />
        )}
      </button>

      {showEmojis && (
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
          {REACTION_NAMES.map((name, index) => (
            <Button
              type="button"
              key={`${name}-${index}`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => {
                onReact(name)
                setShowEmojis(false)
              }}
            >
              <lottie-player
                id={`reaction-picker-${name}-${postId}`}
                autoplay
                loop
                mode="normal"
                src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/lottie/${name}.json`}
                style={{ width: '24px', height: '24px' }}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostReactionControl
