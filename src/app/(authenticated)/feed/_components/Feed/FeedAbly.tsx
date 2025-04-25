'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'

import FeedSkeleton from '@/components/FeedSkeleton'

// Use absolute paths for dynamic imports
const FeedNoAbly = dynamic(
  () => import('@/app/(authenticated)/feed/_components/Feed/FeedNoAbly'),
  { ssr: false }
)
const FeedWithAbly = dynamic(
  () => import('@/app/(authenticated)/feed/_components/Feed/FeedWithAbly'),
  { ssr: false }
)

const FeedAbly = ({
  initialPosts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status
}: {
  initialPosts: IPost[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  status: string
}) => {
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null)
  const [ablyError, setAblyError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let client: Ably.Realtime | null = null

    const initAbly = async () => {
      try {
        client = new Ably.Realtime({ authUrl: '/api/token' })

        client.connection.on('failed', () => {
          console.warn('Ably connection failed, falling back to static mode')
          setAblyError(true)
          setIsLoading(false)
        })

        client.connection.on('suspended', () => {
          console.warn('Ably connection suspended, falling back to static mode')
          setAblyError(true)
          setIsLoading(false)
        })

        client.connection.on('connected', () => {
          console.log('Ably connected successfully')
          setAblyClient(client)
          setIsLoading(false)
        })
      } catch (error) {
        console.warn('Failed to initialize Ably:', error)
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

  // Show loading indicator while initializing Ably
  if (isLoading) {
    return <FeedSkeleton />
  }

  // If Ably initialization failed, render without real-time features
  if (ablyError || !ablyClient) {
    return (
      <FeedNoAbly
        initialPosts={initialPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
      />
    )
  }

  // If Ably is ready, render with real-time features
  return (
    <AblyProvider client={ablyClient}>
      <FeedWithAbly
        initialPosts={initialPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
      />
    </AblyProvider>
  )
}

export default FeedAbly
