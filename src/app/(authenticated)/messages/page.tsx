'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import getLimit from '@/utils/getLimit'
import { useInfiniteQuery } from '@tanstack/react-query'

const MessagesAbly = dynamic(
  () => import('@/components/messages/MessagesAbly'),
  {
    ssr: false
  }
)

const MessagesPage = () => {
  const [limit, setLimit] = useState(getLimit())

  useEffect(() => {
    setLimit(getLimit())
    const handleResize = () => setLimit(getLimit())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['conversations', limit],
      queryFn: async ({ pageParam }) => {
        const res = await fetch(
          `/api/conversations?limit=${limit}&cursor=${pageParam || ''}`
        )
        return res.json()
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null
    })

  // Flatten all conversations
  const conversations = data?.pages
    ? data.pages.flatMap((page) => page.data || [])
    : []
  return (
    <main className="flex h-screen w-full grow flex-col items-stretch bg-transparent p-0">
      <MessagesAbly
        conversations={conversations}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
      />
    </main>
  )
}

export default MessagesPage
