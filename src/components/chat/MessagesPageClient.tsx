'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { messagesPageMainClassName } from '@/lib/uiChrome'

const MessagesAbly = dynamic(() => import('@/components/chat/MessagesAbly'), {
  ssr: false
})

const MessagesPageClient = () => (
  <main className={messagesPageMainClassName}>
    <Suspense fallback={null}>
      <MessagesAbly />
    </Suspense>
  </main>
)

export default MessagesPageClient
