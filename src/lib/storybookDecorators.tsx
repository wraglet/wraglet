import {
  appShellPageWashClassName,
  mobileFabStackBottomClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Decorator } from '@storybook/nextjs-vite'

import { ChatIcon } from '@/components/shared/NavIcons'

/**
 * ChatFloater’s fixed column (`ChatFloater.tsx`): panel above, badge button below —
 * same `right` / `bottom` / `gap` tokens as production.
 */
export const withChatFloaterColumn: Decorator = (Story) => (
  <div className={cn('relative min-h-screen', appShellPageWashClassName)}>
    <div
      className={cn(
        'fixed right-3 z-50 flex flex-col items-end gap-2 sm:right-5',
        mobileFabStackBottomClassName,
        'lg:right-6 lg:bottom-6'
      )}
    >
      <Story />
      <div
        className="pointer-events-none relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-[0_8px_28px_-8px_rgba(14,165,233,0.5)] ring-2 ring-sky-200/50 backdrop-blur-md transition sm:h-12 sm:w-12"
        aria-hidden
      >
        <ChatIcon className="h-5 w-5 text-sky-600 sm:h-6 sm:w-6" />
      </div>
    </div>
  </div>
)
