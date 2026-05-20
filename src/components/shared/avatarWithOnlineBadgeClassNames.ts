import { mergeClassNames } from '@/lib/uiChrome'

export const avatarWithOnlineBadgeWrapClassName = 'relative shrink-0'

export const mergeAvatarWithOnlineBadgeClassName = (extra?: string): string =>
  mergeClassNames(avatarWithOnlineBadgeWrapClassName, extra)
