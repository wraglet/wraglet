'use client'

import Image from 'next/image'
import Link from 'next/link'

interface BlogPreviewCardProps {
  blogPreview: {
    url: string
    slug: string
    title: string
    summary?: string
    category?: string
    coverImage?: string | null
  }
}

const BlogPreviewCard = ({ blogPreview }: BlogPreviewCardProps) => {
  return (
    <Link
      href={`/blog/${blogPreview.slug}`}
      className="my-2 block overflow-hidden rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-sm transition-shadow hover:border-[#0EA5E9]/35 hover:shadow-md sm:rounded-lg"
    >
      {/* Cover Image */}
      {blogPreview.coverImage && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={blogPreview.coverImage}
            alt={blogPreview.title}
            width={600}
            height={337}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Blog Preview Content */}
      <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
        {blogPreview.category && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-px text-[0.65rem] leading-tight font-semibold text-emerald-800">
              {blogPreview.category}
            </span>
          </div>
        )}

        <h3 className="mb-1 line-clamp-2 text-sm leading-snug font-bold text-gray-900 transition-colors hover:text-[#0EA5E9]">
          {blogPreview.title}
        </h3>

        {blogPreview.summary && (
          <p className="mb-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600">
            {blogPreview.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-xs font-medium text-[#0EA5E9]">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="font-medium">Read blog post</span>
          </div>
          <span className="text-xs text-gray-400">
            {new URL(blogPreview.url).hostname}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default BlogPreviewCard
