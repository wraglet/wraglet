'use client'

import dynamic from 'next/dynamic'
import { IPost } from '@/models/Post'

// Use absolute paths for dynamic imports
const FeedNoAbly = dynamic(() => import('@/components/feed/FeedNoAbly'), {
  ssr: false
})
const FeedWithAbly = dynamic(() => import('@/components/feed/FeedWithAbly'), {
  ssr: false
})

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
  // Since we're already wrapped in the global AblyProvider from the layout,
  // we can directly render the Ably-enabled component
  return (
    <FeedWithAbly
      initialPosts={initialPosts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      status={status}
    />
  )
}

export default FeedAbly
