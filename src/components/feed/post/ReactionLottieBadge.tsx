'use client'

import { useEffect } from 'react'
import { normalizeReactionType } from '@/utils/reactionTypes'

import {
  reactionLottieBadgeFallbackClassName,
  reactionLottiePlayerClassName
} from '@/components/feed/post/reactionLottieBadgeClassNames'
import ReactionIcon from '@/components/shared/ReactionIcon'

interface ReactionLottieBadgeProps {
  type: unknown
  postId: string
}

const buildLottieSrc = (reactionType: string): string => {
  const base = process.env.NEXT_PUBLIC_R2_FILES_URL ?? ''
  return `${base}/lottie/${reactionType}.json`
}

const ReactionLottieBadge = ({ type, postId }: ReactionLottieBadgeProps) => {
  useEffect(() => {
    import('@lottiefiles/lottie-player')
  }, [])

  const reactionType = normalizeReactionType(type)

  if (!reactionType) {
    return (
      <span className={reactionLottieBadgeFallbackClassName}>
        <ReactionIcon type="like" />
      </span>
    )
  }

  const lottieSrc = buildLottieSrc(reactionType)
  const playerId = `reaction-display-${reactionType}-${postId}`

  return (
    <lottie-player
      id={playerId}
      autoplay={true}
      loop={true}
      mode="normal"
      src={lottieSrc}
      className={reactionLottiePlayerClassName}
    />
  )
}

export default ReactionLottieBadge
