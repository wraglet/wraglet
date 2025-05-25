'use client'

import { useEffect, useState } from 'react'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

import ChatFloater from '@/components/ChatFloater'

interface ChatFloaterAblyProps {
  userId: string
}

const ChatFloaterAbly = ({ userId }: ChatFloaterAblyProps) => {
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

  if (isLoading || ablyError || !ablyClient) return null

  return (
    <AblyProvider client={ablyClient}>
      <ChannelProvider channelName={`user-${userId}-messages`}>
        <ChatFloater userId={userId} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default ChatFloaterAbly
