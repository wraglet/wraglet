'use client'

import { useEffect, useState } from 'react'
import { IPost } from '@/models/Post'
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'

import PostNoAbly from '@/components/PostNoAbly'
import PostSkeleton from '@/components/PostSkeleton'
import PostWithAbly from '@/components/PostWithAbly'

interface PostAblyProps {
  post: IPost
}

const PostAbly = ({ post }: PostAblyProps) => {
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
    return <PostSkeleton />
  }

  // If Ably initialization failed, render without real-time features
  if (ablyError || !ablyClient) {
    return <PostNoAbly post={post} />
  }

  // If Ably is ready, render with real-time features
  return (
    <AblyProvider client={ablyClient}>
      <PostWithAbly post={post} />
    </AblyProvider>
  )
}

export default PostAbly
