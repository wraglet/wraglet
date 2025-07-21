'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IBlog } from '@/models/Blog'
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import Button from '@/components/shared/Button'

interface BlogDashboardProps {
  user: any
}

interface BlogStatsProps {
  blogs: IBlog[]
}

const BlogStats = ({ blogs }: BlogStatsProps) => {
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
  const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
  const publishedBlogs = blogs.filter(
    (blog) => blog.status === 'published'
  ).length
  const draftBlogs = blogs.filter((blog) => blog.status === 'draft').length

  const stats = [
    {
      label: 'Published Blogs',
      value: publishedBlogs,
      icon: DocumentTextIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Draft Blogs',
      value: draftBlogs,
      icon: PencilIcon,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: HeartIcon,
      color: 'text-red-600 bg-red-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className={`rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface BlogListItemProps {
  blog: IBlog
  onEdit: (blog: IBlog) => void
  onDelete: (blogId: string) => void
}

const BlogListItem = ({ blog, onEdit, onDelete }: BlogListItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this blog? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      await axios.delete(`/api/blogs/${blog.slug}`)
      onDelete(blog._id)
      toast.success('Blog deleted successfully')
    } catch (error) {
      toast.error('Failed to delete blog')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                blog.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : blog.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
            </span>
            <span className="text-xs text-gray-500">{blog.category}</span>
          </div>

          <Link href={`/blog/${blog.slug}`}>
            <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-blue-600">
              {blog.title}
            </h3>
          </Link>

          <p className="mb-4 line-clamp-2 text-gray-600">{blog.summary}</p>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(blog.createdAt || Date.now()), {
                  addSuffix: true
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{blog.readTime}m read</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-3 w-3" />
              <span>{blog.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-3 w-3" />
              <span>{blog.likes || 0}</span>
            </div>
          </div>
        </div>

        {blog.coverImage?.url && (
          <div className="ml-6 h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={blog.coverImage.url}
              alt={blog.title}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex space-x-2">
          <Link href={`/blog/${blog.slug}/edit`}>
            <Button className="flex h-8 items-center space-x-1 border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50">
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Link>

          {blog.status === 'published' && (
            <Button
              className="flex h-8 items-center space-x-1 border border-gray-300 bg-white px-3 text-xs hover:bg-gray-50"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/blog/${blog.slug}`
                )
                toast.success('Link copied to clipboard')
              }}
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </Button>
          )}
        </div>

        <Button
          className="flex h-8 items-center space-x-1 border border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <TrashIcon className="h-4 w-4" />
          <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
        </Button>
      </div>
    </div>
  )
}

const BlogDashboard = ({ user }: BlogDashboardProps) => {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Fetch user's blogs
  const {
    data: blogs = [],
    refetch,
    isLoading
  } = useQuery({
    queryKey: ['user-blogs', user._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/blogs?author=${user._id}&status=all`
      )
      return response.data.blogs
    }
  })

  const filteredBlogs = blogs.filter((blog: IBlog) => {
    if (filter === 'all') return true
    return blog.status === filter
  })

  const handleDelete = (blogId: string) => {
    refetch()
  }

  const handleEdit = (blog: IBlog) => {
    // Navigate to edit page - this would be handled by the Link in BlogListItem
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Manage your blogs and track performance
            </p>
          </div>

          <Link href="/blog/create">
            <Button className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" />
              <span>New Blog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <BlogStats blogs={blogs} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {[
            { key: 'all', label: 'All Blogs' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Drafts' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-full rounded bg-gray-200"></div>
              <div className="flex space-x-4">
                <div className="h-3 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
                <div className="h-3 w-12 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-12 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' ? 'No blogs yet' : `No ${filter} blogs`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? 'Get started by creating your first blog post.'
              : `You don't have any ${filter} blogs yet.`}
          </p>
          <div className="mt-6">
            <Link href="/blog/create">
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Create Blog</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((blog: IBlog) => (
            <BlogListItem
              key={blog._id}
              blog={blog}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogDashboard
