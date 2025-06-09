'use client'

import { useEffect, useState } from 'react'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'

import HeaderNotificationsIcon from '@/components/HeaderNotificationsIcon'
import { BellIcon } from '@/components/NavIcons'

interface HeaderNotificationsIconAblyProps {
  userId: string
}

const HeaderNotificationsIconAbly = ({
  userId
}: HeaderNotificationsIconAblyProps) => {
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null)
  const [ablyError, setAblyError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
        console.error('Ably initialization error:', error)
        setAblyError(true)
        setIsLoading(false)
      }
    }

    initAbly()

    return () => {
      if (client) {
        client.close()
      }
    }
  }, [])

  if (isLoading) {
    return <BellIcon className="text-white" />
  }

  if (ablyError || !ablyClient) {
    return <HeaderNotificationsIcon userId={userId} ablyError={true} />
  }

  return (
    <AblyProvider client={ablyClient}>
      <ChannelProvider channelName={`user-${userId}-notifications`}>
        <HeaderNotificationsIcon userId={userId} />
      </ChannelProvider>
    </AblyProvider>
  )
}

export default HeaderNotificationsIconAbly
