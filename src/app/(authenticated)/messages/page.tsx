'use client'

import dynamic from 'next/dynamic'

const MessagesAbly = dynamic(
  () => import('@/components/messages/MessagesAbly'),
  {
    ssr: false
  }
)

const MessagesPage = () => {
  return (
    <main className="flex h-screen w-full grow flex-col items-stretch bg-transparent p-0">
      <MessagesAbly />
    </main>
  )
}

export default MessagesPage
