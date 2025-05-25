'use client'

import { useEffect, useState } from 'react'
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'

import type { IConversation } from '@/types/conversation'
import MessagesWithAbly from '@/components/messages/MessagesWithAbly'

interface MessagesAblyProps {
  conversations?: IConversation[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
}

const MessagesAbly = ({
  conversations,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
}: MessagesAblyProps) => {
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ablyError, setAblyError] = useState(false)

  useEffect(() => {
    let client: Ably.Realtime | null = null
    const initAbly = async () => {
      try {
        client = new Ably.Realtime({ authUrl: '/api/token' })
        client.connection.on('connected', () => {
          setAblyClient(client)
          setIsLoading(false)
        })
        client.connection.on('failed', () => {
          setAblyError(true)
          setIsLoading(false)
        })
        client.connection.on('suspended', () => {
          setAblyError(true)
          setIsLoading(false)
        })
      } catch (error) {
        setAblyError(true)
        setIsLoading(false)
      }
    }
    initAbly()
    return () => {
      if (client) client.close()
    }
  }, [])

  if (isLoading) return <div>Loading messages...</div>
  if (ablyError || !ablyClient) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-400">
        Could not connect to real-time chat. Please refresh or try again later.
      </div>
    )
  }

  return (
    <AblyProvider client={ablyClient}>
      <MessagesWithAbly
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
      />
    </AblyProvider>
  )
}

export default MessagesAbly
