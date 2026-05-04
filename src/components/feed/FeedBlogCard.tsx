'use client'

import Image from 'next/image'
import Link from 'next/link'
import { profileHrefFromUsername } from '@/lib/profileHref'
import type { IBlog } from '@/models/Blog'
import { ClockIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

import { DEFAULT_GENDER } from '@/data/constants'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

interface FeedBlogCardProps {
  blog: IBlog
}

const FeedBlogCard = ({ blog }: FeedBlogCardProps) => {
  const authorProfileHref = profileHrefFromUsername(blog.author?.username)
  const blogDateRaw = blog.publishedAt || blog.createdAt
  const displayName = [blog.author?.firstName, blog.author?.lastName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex w-full flex-col overflow-hidden border border-solid border-neutral-200 bg-white drop-shadow-md sm:rounded-lg">
      <div className="flex items-start gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        {authorProfileHref ? (
          <Link
            href={authorProfileHref}
            className="mt-0.5 shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
          >
            <Avatar
              gender={blog.author?.gender || DEFAULT_GENDER}
              src={blog.author?.profilePicture?.url || null}
              className="shrink-0"
              alt={displayName || 'Author'}
            />
          </Link>
        ) : (
          <Avatar
            gender={blog.author?.gender || DEFAULT_GENDER}
            src={blog.author?.profilePicture?.url || null}
            className="mt-0.5 shrink-0"
            alt={displayName || 'Author'}
          />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <p className="text-sm leading-none font-bold text-gray-900">
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  className="rounded-sm hover:text-[#0EA5E9] focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30 focus-visible:outline-none"
                >
                  {displayName || 'Unknown'}
                </Link>
              ) : (
                displayName || 'Unknown'
              )}
            </p>
            {blogDateRaw ? (
              <>
                <svg
                  className="self-center"
                  width="2"
                  height="3"
                  viewBox="0 0 2 3"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <circle cx="1" cy="1.85547" r="1" fill="#4B5563" />
                </svg>
                <p className="text-xs leading-none text-zinc-500">
                  {formatDistanceToNow(new Date(blogDateRaw), {
                    addSuffix: true
                  })}
                </p>
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
              {blog.readTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5 shrink-0" />
              {blog.views ?? 0} views
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-3 pt-0 pb-1.5 sm:px-4">
        <h3 className="text-sm leading-snug font-bold text-gray-900">
          <Link
            href={`/blog/${blog.slug}`}
            className="transition-colors hover:text-[#0EA5E9]"
          >
            {blog.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
          {blog.summary}
        </p>
      </div>

      {blog.coverImage?.url && (
        <div className="aspect-[16/9] overflow-hidden border-y border-neutral-200">
          <Image
            src={blog.coverImage.url}
            alt={blog.title}
            width={600}
            height={337}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="px-3 pt-1 pb-2.5 sm:px-4">
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={`tag-${tag}-${index}`}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-1.5 py-px text-[0.65rem] leading-tight font-semibold text-emerald-800">
            <span>Blog</span>
            <span className="text-emerald-600/80" aria-hidden>
              ·
            </span>
            <span>{blog.category}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7ECF0] pt-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <HeartIcon className="h-3.5 w-3.5 shrink-0" />
              {blog.likes || 0} reactions
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full bg-sky-500 px-3 text-xs font-semibold text-white hover:bg-sky-600"
          >
            <Link href={`/blog/${blog.slug}`}>Read more</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FeedBlogCard
