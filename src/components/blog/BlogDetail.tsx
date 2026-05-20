'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { PublicUser } from '@/interfaces'
import {
  profileHrefFromUsername,
  usernameToDisplayHandle
} from '@/lib/profileHref'
import { sanitizeTipTapHtml } from '@/lib/sanitizeTipTapHtml'
import type { IBlog } from '@/models/Blog'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import BlogInteractionsAbly from '@/components/blog/BlogInteractionsAbly'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

interface BlogDetailProps {
  blog: IBlog
  currentUser: PublicUser | null
}

const BlogDetail = ({ blog, currentUser }: BlogDetailProps) => {
  const isAuthor = currentUser?._id === blog.author._id
  const publishedAt = blog.publishedAt || blog.createdAt
  const authorProfileHref = profileHrefFromUsername(blog.author.username)
  const authorDisplayName =
    `${blog.author.firstName} ${blog.author.lastName}`.trim()
  const reactionOrLikeCount =
    (blog.reactions?.length ?? 0) > 0 ? blog.reactions?.length : blog.likes

  return (
    <article className="mx-auto w-full max-w-2xl min-w-0 overflow-x-hidden border border-solid border-neutral-200 bg-white p-3 drop-shadow-md sm:rounded-lg sm:p-4">
      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-xs text-gray-600 hover:text-gray-900"
        >
          <Link href="/feed?tab=blogs">Back to blogs</Link>
        </Button>

        {isAuthor && (
          <Button
            asChild
            size="sm"
            className="h-8 shrink-0 gap-1 bg-sky-500 px-2.5 text-xs text-white hover:bg-sky-600 sm:px-3"
          >
            <Link href={`/blog/${blog.slug}/edit`}>
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-3 flex min-w-0 flex-col gap-2 border-b border-[#E7ECF0] pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {authorProfileHref ? (
            <Link
              href={authorProfileHref}
              className="mt-0.5 shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
            >
              <Avatar
                gender={blog.author.gender}
                src={blog.author.profilePicture?.url || null}
                className="shrink-0"
              />
            </Link>
          ) : (
            <Avatar
              gender={blog.author.gender}
              src={blog.author.profilePicture?.url || null}
              className="mt-0.5 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 break-words">
              <p className="min-w-0 text-sm leading-snug font-bold text-gray-900">
                {authorProfileHref ? (
                  <Link
                    href={authorProfileHref}
                    className="hover:text-[#0EA5E9] focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30 focus-visible:outline-none"
                  >
                    {authorDisplayName}
                  </Link>
                ) : (
                  authorDisplayName
                )}
              </p>
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  className="min-w-0 text-xs break-words text-gray-500 hover:text-[#0EA5E9]"
                >
                  {usernameToDisplayHandle(blog.author.username)}
                </Link>
              ) : (
                <span className="min-w-0 text-xs break-words text-gray-500">
                  {usernameToDisplayHandle(blog.author.username)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                {publishedAt
                  ? formatDistanceToNow(new Date(publishedAt), {
                      addSuffix: true
                    })
                  : '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                {blog.readTime} min read
              </span>
              <span className="inline-flex items-center gap-1">
                <EyeIcon className="h-3.5 w-3.5 shrink-0" />
                {blog.views} views
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <div className="inline-flex items-center gap-1 rounded-full bg-[#E7ECF0] px-2 py-0.5 text-xs text-gray-700">
            <HeartIcon className="h-3.5 w-3.5" />
            <span>{reactionOrLikeCount}</span>
          </div>
          {!isAuthor && authorProfileHref && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-xs"
            >
              <Link href={authorProfileHref}>View profile</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] leading-tight font-semibold text-emerald-800">
          <span>Blog</span>
          <span className="text-emerald-600/80" aria-hidden>
            ·
          </span>
          <span>{blog.category}</span>
        </span>
      </div>

      <h1 className="mb-1.5 text-sm leading-snug font-bold break-words text-gray-900 sm:text-base">
        {blog.title}
      </h1>

      <p className="mb-3 text-xs leading-relaxed text-gray-600">
        {blog.summary}
      </p>

      {blog.coverImage?.url && (
        <div className="mb-3 overflow-hidden rounded-md border border-neutral-200">
          <Image
            src={blog.coverImage.url}
            alt={blog.title}
            width={800}
            height={400}
            className="h-44 max-h-full w-full max-w-full object-cover sm:h-48"
            priority
          />
        </div>
      )}

      <div className="prose prose-sm max-w-none min-w-0 break-words">
        {blog.contentBlocks && blog.contentBlocks.length > 0 ? (
          <div className="space-y-3">
            {[...blog.contentBlocks]
              .sort((a, b) => a.order - b.order)
              .map((block) => {
                switch (block.type) {
                  case 'text':
                    return (
                      <div
                        key={block.id}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeTipTapHtml(block.content ?? '')
                        }}
                        className="prose-headings:text-gray-900 prose-a:text-[#0EA5E9] prose-a:break-all prose-strong:text-gray-900 prose-p:text-sm prose-p:text-gray-700 prose-li:text-sm prose-li:text-gray-700 break-words"
                      />
                    )
                  case 'image':
                    return (
                      <div key={block.id} className="my-3">
                        {block.metadata?.url && (
                          <div className="overflow-hidden rounded-md">
                            <Image
                              src={block.metadata.url}
                              alt={block.metadata.alt || 'Blog image'}
                              width={800}
                              height={400}
                              className="w-full object-cover"
                            />
                          </div>
                        )}
                        {block.metadata?.caption && (
                          <p className="mt-1.5 text-center text-xs text-gray-600">
                            {block.metadata.caption}
                          </p>
                        )}
                      </div>
                    )
                  case 'code':
                    return (
                      <div key={block.id} className="my-3">
                        <pre className="overflow-x-auto rounded-md bg-gray-900 p-2.5 text-xs text-gray-100">
                          <code>{block.content}</code>
                        </pre>
                        {block.metadata?.language && (
                          <div className="mt-2 text-right text-xs text-gray-500">
                            {block.metadata.language}
                          </div>
                        )}
                      </div>
                    )
                  case 'video':
                    return (
                      <div key={block.id} className="my-3">
                        {block.metadata?.url && (
                          <div className="overflow-hidden rounded-md">
                            <video
                              controls
                              className="w-full"
                              src={block.metadata.url}
                            >
                              <track kind="captions" label="Captions" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        {block.metadata?.caption && (
                          <p className="mt-1.5 text-center text-xs text-gray-600">
                            {block.metadata.caption}
                          </p>
                        )}
                      </div>
                    )
                  default:
                    return null
                }
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No content to display.</p>
        )}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-3 border-t border-[#E7ECF0] pt-2">
          <h3 className="mb-1 text-xs font-bold text-gray-900">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <BlogInteractionsAbly blog={blog} currentUser={currentUser} />

      {currentUser?._id !== blog.author._id && blog.author.bio && (
        <div className="mt-3 border-t border-[#E7ECF0] pt-2">
          <p className="text-xs text-gray-600">{blog.author.bio}</p>
        </div>
      )}
    </article>
  )
}

export default BlogDetail
