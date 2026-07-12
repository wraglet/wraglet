import type { Metadata } from 'next'
import Link from 'next/link'
import getPostById from '@/actions/getPostById'
import {
  authenticatedBackLinkClassName,
  centeredListPageCardClassName,
  centeredListPageEmptyBodyClassName,
  centeredListPageEmptyStateClassName,
  centeredListPageEmptyTitleClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

import PostClientWrapper from '@/components/feed/PostClientWrapper'

import {
  postBackToFeedButtonClassName,
  postContentWrapClassName,
  postNotFoundBodyClassName,
  postNotFoundCardClassName
} from '@/app/(authenticated)/post/postDetailPageClassNames'

export const generateMetadata = async ({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    return { title: 'Post not found' }
  }

  const author = post.author
  const authorName =
    typeof author === 'object' && author !== null
      ? [author.firstName, author.lastName].filter(Boolean).join(' ') ||
        author.username
      : 'Wraglet user'

  const preview =
    typeof post.content?.text === 'string'
      ? post.content.text.slice(0, 120)
      : 'View this post on Wraglet'

  return {
    title: `Post by ${authorName}`,
    description: preview
  }
}

const PostPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const post = await getPostById(id)

  if (!post) {
    return (
      <>
        <Link href="/feed" className={authenticatedBackLinkClassName}>
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Feed
        </Link>
        <div
          className={cn(
            postNotFoundCardClassName,
            centeredListPageCardClassName,
            centeredListPageEmptyStateClassName
          )}
        >
          <h2 className={centeredListPageEmptyTitleClassName}>
            Post not found
          </h2>
          <p
            className={cn(
              postNotFoundBodyClassName,
              centeredListPageEmptyBodyClassName
            )}
          >
            The post you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Link href="/feed" className={postBackToFeedButtonClassName}>
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Feed
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Link href="/feed" className={authenticatedBackLinkClassName}>
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Feed
      </Link>
      <div className={postContentWrapClassName}>
        <PostClientWrapper post={post} />
      </div>
    </>
  )
}

export default PostPage
