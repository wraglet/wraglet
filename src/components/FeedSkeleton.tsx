'use client'

import PostSkeleton from '@/components/PostSkeleton'

const FeedSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Create Post placeholder */}
      <div className="flex w-full items-start gap-2 border border-solid border-neutral-200 bg-white p-4 drop-shadow-md sm:rounded-lg">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="h-10 w-full rounded-full border border-solid border-neutral-200 bg-gray-100"></div>
      </div>

      {/* Multiple post skeletons */}
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  )
}

export default FeedSkeleton
