'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

const HeaderMessagesIcon = dynamic(
  () => import('@/components/HeaderMessagesIcon'),
  { ssr: false }
)

const HeaderMessagesIconAbly = ({ userId }: { userId: string }) => {
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

  if (isLoading) return null
  if (ablyError || !ablyClient) {
    // Render fallback UI: show HeaderMessagesIcon with a '?' badge
    return (
      <HeaderMessagesIcon userId={userId} initialUnreadCount={0} ablyError />
    )
  }

  return (
    <AblyProvider client={ablyClient}>
      <ChannelProvider channelName={`user-${userId}-messages`}>
        <HeaderMessagesIcon userId={userId} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default HeaderMessagesIconAbly
