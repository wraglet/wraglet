'use client'

import {
  mobileFullHeightPanelClassName,
  mobileMainBottomInsetClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'

import MessagesAbly from '@/components/chat/MessagesAbly'

const MessagesPage = () => {
  return (
    <main
      className={cn(
        mobileFullHeightPanelClassName,
        mobileMainBottomInsetClassName
      )}
    >
      <MessagesAbly />
    </main>
  )
}

export default MessagesPage
