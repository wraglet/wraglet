'use client'

import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'

import type { IConversation } from '@/types/conversation'
import ChatFloater from '@/components/ChatFloater'

const ChatFloaterAbly = () => {
  const { user } = useUserStore()

  const { data: conversations = [] } = useQuery<IConversation[]>({
    queryKey: ['conversations', user?._id],
    queryFn: async () => {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      return data.data
    },
    enabled: !!user?._id
  })

  return <ChatFloater conversations={conversations} />
}

export default ChatFloaterAbly
