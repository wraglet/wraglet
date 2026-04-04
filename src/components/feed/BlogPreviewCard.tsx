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
      className="my-3 block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:border-blue-300 hover:shadow-md"
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
      <div className="p-4">
        {/* Category Badge */}
        {blogPreview.category && (
          <div className="mb-2">
            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
              {blogPreview.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 transition-colors hover:text-blue-600">
          {blogPreview.title}
        </h3>

        {/* Summary */}
        {blogPreview.summary && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {blogPreview.summary}
          </p>
        )}

        {/* Footer - Link indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-blue-600">
            <svg
              className="h-4 w-4"
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

