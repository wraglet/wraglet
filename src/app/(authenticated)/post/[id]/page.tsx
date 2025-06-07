import Link from 'next/link'
import getPostById from '@/actions/getPostById'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import PostClientWrapper from '@/components/PostClientWrapper'

const PostPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/feed"
            className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Feed
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Post not found
          </h2>
          <p className="mb-4 text-gray-600">
            The post you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/feed"
          className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Feed
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Post Details</h1>
      </div>

      {/* Post */}
      <div className="mb-6">
        <PostClientWrapper post={post} />
      </div>
    </div>
  )
}

export default PostPage
