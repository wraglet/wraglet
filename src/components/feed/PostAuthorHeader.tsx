'use client'

import { Key } from 'react'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import type { IPost } from '@/models/Post'
import { formatDistanceToNow } from 'date-fns'

import { DEFAULT_GENDER } from '@/data/constants'
import BlogPreviewCard from '@/components/feed/BlogPreviewCard'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

interface PostAuthorHeaderProps {
  post: IPost
  authorProfileHref: string | null
  authorDisplayName: string
  isAuthor: boolean
  authorId: string | null
  isFollowing: boolean
  follow: () => void
  loading: boolean
}

const PostAuthorHeader = ({
  post,
  authorProfileHref,
  authorDisplayName,
  isAuthor,
  authorId,
  isFollowing,
  follow,
  loading
}: PostAuthorHeaderProps) => {
  const author = post.author

  return (
    <>
      {authorProfileHref ? (
        <Link
          href={authorProfileHref}
          className="mt-0.5 shrink-0 rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
        >
          <Avatar
            gender={author?.gender ?? DEFAULT_GENDER}
            src={author?.profilePicture?.url || null}
            className="shrink-0"
          />
        </Link>
      ) : (
        <Avatar
          gender={author?.gender ?? DEFAULT_GENDER}
          src={author?.profilePicture?.url || null}
          className="mt-0.5 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
            <h3 className={`text-sm leading-none font-bold`}>
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  className="rounded-sm hover:text-[#0EA5E9] focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/30 focus-visible:outline-none"
                >
                  {authorDisplayName}
                </Link>
              ) : (
                authorDisplayName
              )}
            </h3>
            {!isAuthor &&
              authorId &&
              (isFollowing ? (
                <span className="text-xs font-semibold text-sky-600">
                  Following
                </span>
              ) : (
                <Button
                  type="button"
                  className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-600 hover:bg-sky-500 hover:text-white disabled:opacity-60"
                  onClick={() => follow()}
                  disabled={loading}
                >
                  Follow
                </Button>
              ))}
            <svg
              className="self-center"
              width="2"
              height="3"
              viewBox="0 0 2 3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="1" cy="1.85547" r="1" fill="#4B5563" />
            </svg>
            {post.createdAt && (
              <h4 className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(post.createdAt.toString()), {
                  addSuffix: true
                })}
              </h4>
            )}
          </div>
          {post.content.text && (
            <Link
              href={`/post/${post._id}`}
              className="-m-1 block rounded-md p-1 transition-colors hover:bg-gray-50"
            >
              <p className="cursor-pointer text-xs text-gray-600">
                {post.content.text}
              </p>
            </Link>
          )}

          {post.content.blogPreview ? (
            <BlogPreviewCard blogPreview={post.content.blogPreview} />
          ) : (
            post.content.images &&
            post.content.images.map(
              (
                image: {
                  key: Key | null | undefined
                  url: string | StaticImport
                },
                index: number
              ) => (
                <div
                  key={image.key || `image-${index}`}
                  className="my-3 block overflow-hidden rounded-md"
                >
                  <Image
                    src={image.url}
                    alt="Post Image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    width={1}
                    height={1}
                    style={{
                      height: 'auto',
                      width: '100%'
                    }}
                  />
                </div>
              )
            )
          )}
        </div>
      </div>
    </>
  )
}

export default PostAuthorHeader
