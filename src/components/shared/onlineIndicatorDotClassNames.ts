import { mergeClassNames } from '@/lib/uiChrome'

export const onlineIndicatorDotBaseClassName =
  'absolute right-0 bottom-0 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 shadow-sm'

export const mergeOnlineIndicatorDotClassName = (extra?: string): string =>
  mergeClassNames(onlineIndicatorDotBaseClassName, extra)
