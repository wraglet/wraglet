'use client'

import type { ReactNode } from 'react'

import { useCanShowOnlineBadge } from '@/hooks/useCanShowOnlineBadge'
import { mergeAvatarWithOnlineBadgeClassName } from '@/components/shared/avatarWithOnlineBadgeClassNames'
import OnlineIndicatorDot from '@/components/shared/OnlineIndicatorDot'

interface AvatarWithOnlineBadgeProps {
  userId: string | undefined
  children: ReactNode
  className?: string
}

const AvatarWithOnlineBadge = ({
  userId,
  children,
  className
}: AvatarWithOnlineBadgeProps) => {
  const showOnline = useCanShowOnlineBadge(userId)
  const wrapClassName = mergeAvatarWithOnlineBadgeClassName(className)

  return (
    <div className={wrapClassName}>
      {children}
      {showOnline ? <OnlineIndicatorDot /> : null}
    </div>
  )
}

export default AvatarWithOnlineBadge
