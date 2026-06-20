'use client'

import { messagesPageMainClassName } from '@/lib/uiChrome'

import MessagesAbly from '@/components/chat/MessagesAbly'

const MessagesPage = () => {
  return (
    <main className={messagesPageMainClassName}>
      <MessagesAbly />
    </main>
  )
}

export default MessagesPage
