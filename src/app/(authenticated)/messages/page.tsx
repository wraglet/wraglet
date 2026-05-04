'use client'

import MessagesAbly from '@/components/chat/MessagesAbly'

const MessagesPage = () => {
  return (
    <main className="fixed top-[56px] right-0 bottom-16 left-0 flex flex-col items-stretch bg-transparent p-0 lg:bottom-0">
      <MessagesAbly />
    </main>
  )
}

export default MessagesPage
