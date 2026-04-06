'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PublicUser } from '@/interfaces'
import { IBlog } from '@/models/Blog'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'Business',
  'Lifestyle',
  'Health',
  'Travel',
  'Food',
  'Fashion',
  'Sports',
  'Entertainment',
  'Science',
  'Education',
  'Other'
]

interface BlogDiscoveryProps {
  user: PublicUser
}

interface BlogCardProps {
  blog: IBlog
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Cover Image */}
      {blog.coverImage?.url && (
        <div className="aspect-[16/9] overflow-hidden">
          <Image
            src={blog.coverImage.url}
            alt={blog.title}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-6">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {blog.category}
          </span>
        </div>

        {/* Title & Summary */}
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors hover:text-blue-600">
            {blog.title}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-3 text-gray-600">{blog.summary}</p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              gender={blog.author.gender}
              src={blog.author.profilePicture?.url || null}
              size="h-8 w-8"
            />
            <div>
              <Link
                href={`/${blog.author.username}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                {blog.author.firstName} {blog.author.lastName}
              </Link>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                <span>
                  {(() => {
                    const at = blog.publishedAt || blog.createdAt
                    return at
                      ? formatDistanceToNow(new Date(at), { addSuffix: true })
                      : '—'
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{blog.readTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-3 w-3" />
              <span>{blog.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-3 w-3" />
              <span>{blog.likes}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const BlogDiscovery = ({ user }: BlogDiscoveryProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  )
  const [showFilters, setShowFilters] = useState(false)

  // Infinite query for blogs
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['blogs', selectedCategory, searchQuery],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.set('limit', '12')
      if (pageParam) params.set('cursor', pageParam)
      if (selectedCategory !== 'All') params.set('category', selectedCategory)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())

      const res = await axios.get(`/api/blogs?${params.toString()}`)
      return res.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null
  })

  // Flatten all blogs from all pages
  const blogs = data?.pages?.flatMap((page) => page.blogs ?? []) ?? []

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) {
        params.set('search', query.trim())
      } else {
        params.delete('search')
      }
      router.push(`/blog?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category)
      const params = new URLSearchParams(searchParams.toString())
      if (category !== 'All') {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      router.push(`/blog?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Blogs</h1>
            <p className="mt-1 text-gray-600">
              Explore insightful articles from the community
            </p>
          </div>

          {user && (
            <button
              onClick={() => {
                // Navigate to feed and open blog modal
                window.location.href = '/feed?tab=blogs'
                setTimeout(() => {
                  const { openModal } =
                    require('@/store/blogModal').default.getState()
                  openModal()
                }, 100)
              }}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Write Blog</span>
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search blogs..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Categories */}
        <div className={`mt-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {status === 'pending' ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="mb-4 aspect-[16/9] rounded bg-gray-200"></div>
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            Error loading blogs. Please try again.
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No blogs found.</p>
          {user && (
            <button
              onClick={() => {
                // Navigate to feed and open blog modal
                window.location.href = '/feed?tab=blogs'
                setTimeout(() => {
                  const { openModal } =
                    require('@/store/blogModal').default.getState()
                  openModal()
                }, 100)
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Write the first blog
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

          {/* Load More */}
          {isFetchingNextPage && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
                <span>Loading more blogs...</span>
              </div>
            </div>
          )}

          {!hasNextPage && blogs.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-500">You&apos;ve reached the end!</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BlogDiscovery
