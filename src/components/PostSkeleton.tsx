'use client'

const PostSkeleton = () => {
  return (
    <div className="flex w-full animate-pulse">
      <div className="flex w-full items-start justify-between gap-x-2 border border-solid border-neutral-200 bg-white px-4 py-3 drop-shadow-md sm:rounded-lg">
        {/* Avatar placeholder */}
        <div className="relative block">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>

        <div className="flex grow flex-col justify-start gap-y-5">
          {/* Header placeholder */}
          <div className="flex flex-col gap-y-3">
            <div className="flex items-baseline space-x-1">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-2 w-2 rounded-full bg-gray-200"></div>
              <div className="h-3 w-16 rounded bg-gray-200"></div>
            </div>

            {/* Text content placeholder */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-5/6 rounded bg-gray-200"></div>
              <div className="h-3 w-4/6 rounded bg-gray-200"></div>
            </div>

            {/* Image placeholder */}
            <div className="my-3 h-40 w-full rounded-md bg-gray-200"></div>
          </div>

          {/* Action buttons placeholder */}
          <div className="z-10 flex items-center justify-between bg-white">
            <div className="h-6 w-14 rounded-full bg-gray-200"></div>
            <div className="h-6 w-9 rounded-full bg-gray-200"></div>
            <div className="h-6 w-9 rounded-full bg-gray-200"></div>
            <div className="h-6 w-9 rounded-full bg-gray-200"></div>
          </div>
        </div>

        {/* Menu dots placeholder */}
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-50">
          <div className="flex gap-0.5">
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostSkeleton
