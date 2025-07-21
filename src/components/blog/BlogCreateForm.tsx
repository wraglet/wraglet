'use client'

import { FormEvent, useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'
import toast from 'react-hot-toast'

import { MAX_FILE_SIZE } from '@/data/constants'

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(() => Promise.resolve(EditorContent), {
  ssr: false
})

// Blog constants
const MAX_TITLE_CHARACTERS = 200
const MAX_SUMMARY_CHARACTERS = 500
const MAX_CONTENT_CHARACTERS = 50000 // Much higher limit for blogs

const CATEGORIES = [
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

type ContentBlock = {
  id: string
  type: 'text' | 'code' | 'image' | 'video'
  content: string
  language?: string // for code blocks
  caption?: string // for images/videos
}

interface BlogCreateFormProps {
  onSuccess?: () => void
}

const BlogCreateForm = ({ onSuccess }: BlogCreateFormProps = {}) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      })
    ],
    content: '',
    immediatelyRender: false, // Prevent SSR hydration mismatches
    onUpdate: ({ editor }) => {
      // Content is automatically updated via the editor
    }
  })

  // Character counts
  const titleCount = title.length
  const summaryCount = summary.length
  const contentCount = editor?.getText().length || 0

  // Validation
  const isOverTitleLimit = titleCount > MAX_TITLE_CHARACTERS
  const isOverSummaryLimit = summaryCount > MAX_SUMMARY_CHARACTERS
  const isOverContentLimit = contentCount > MAX_CONTENT_CHARACTERS
  const canSubmit =
    title.trim() &&
    summary.trim() &&
    editor?.getText().trim() &&
    !isOverTitleLimit &&
    !isOverSummaryLimit &&
    !isOverContentLimit

  // Helper function to get content from editor
  const getContent = () => {
    return editor?.getHTML() || ''
  }

  // Handle cover image upload
  const handleCoverImageUpload = useCallback(async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 4MB limit.')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = () => {
        setCoverImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }, [])

  // Add content block
  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      ...(type === 'code' && { language: 'javascript' })
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  // Remove content block
  const removeContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter((block) => block.id !== id))
  }

  // Update content block
  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(
      contentBlocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    )
  }

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    try {
      const blogData = {
        title: title.trim(),
        summary: summary.trim(),
        content: getContent(),
        category,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        coverImageUrl: coverImageUrl || undefined,
        status,
        contentBlocks
      }

      const response = await axios.post('/api/blogs', blogData)

      if (response.status === 201) {
        toast.success(
          `Blog ${status === 'published' ? 'published' : 'saved as draft'} successfully!`
        )
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/blog/${response.data.slug}`)
        }
      }
    } catch (error: any) {
      console.error('Error creating blog:', error)
      toast.error(error.response?.data?.error || 'Failed to create blog')
    } finally {
      setIsLoading(false)
    }
  }

  // Character counter color helper
  const getCharacterCounterColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage > 100) return 'text-red-500'
    if (percentage > 80) return 'text-orange-500'
    return 'text-gray-500'
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Create New Blog
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  status === 'published'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300'
                    : 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300'
                } disabled:cursor-not-allowed disabled:text-gray-500`}
              >
                {isLoading
                  ? 'Creating...'
                  : status === 'published'
                    ? 'Publish Blog'
                    : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-lg border px-4 py-2 text-lg focus:ring-2 focus:outline-none ${
                  isOverTitleLimit
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter blog title..."
                maxLength={MAX_TITLE_CHARACTERS + 20}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span></span>
                <span
                  className={getCharacterCounterColor(
                    titleCount,
                    MAX_TITLE_CHARACTERS
                  )}
                >
                  {titleCount}/{MAX_TITLE_CHARACTERS}
                </span>
              </div>
            </div>

            {/* Summary and Category Row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Summary *
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={`h-24 w-full resize-none rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                    isOverSummaryLimit
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter a brief summary..."
                  maxLength={MAX_SUMMARY_CHARACTERS + 20}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span></span>
                  <span
                    className={getCharacterCounterColor(
                      summaryCount,
                      MAX_SUMMARY_CHARACTERS
                    )}
                  >
                    {summaryCount}/{MAX_SUMMARY_CHARACTERS}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags and Status Row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'draft' | 'published')
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Content Blocks */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Content Blocks
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addContentBlock('text')}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    📝 Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('code')}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    💻 Code
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('image')}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('video')}
                    className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

              {/* Main Rich Text Editor */}
              <div className="mb-6">
                <div className="rounded-lg border border-gray-300">
                  {/* Toolbar */}
                  {editor && (
                    <div className="border-b border-gray-200 bg-gray-50/50 p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleBold().run()
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                            editor.isActive('bold')
                              ? 'border-blue-200 bg-blue-500 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                            editor.isActive('italic')
                              ? 'border-blue-200 bg-blue-500 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Italic
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('underline')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Underline
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('strike')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Strike
                        </button>
                        <div className="w-px bg-gray-300"></div>
                        <button
                          type="button"
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 1 })
                              .run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('heading', { level: 1 })
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 2 })
                              .run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('heading', { level: 2 })
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor
                              .chain()
                              .focus()
                              .toggleHeading({ level: 3 })
                              .run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('heading', { level: 3 })
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          H3
                        </button>
                        <div className="w-px bg-gray-300"></div>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('bulletList')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          List
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('orderedList')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Numbered
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('blockquote')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Quote
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                          }
                          className={`rounded px-2 py-1 text-sm ${
                            editor.isActive('codeBlock')
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Code
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Editor Content */}
                  <div className="bg-white p-4">
                    {editor ? (
                      <TipTapEditor
                        editor={editor}
                        className="prose prose-sm min-h-[300px] max-w-none focus:outline-none [&_h1]:my-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-medium [&_p]:my-2"
                      />
                    ) : (
                      <div className="flex min-h-[300px] items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
                          <p>Loading editor...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500">
                    Start writing your blog content...
                  </span>
                  <span
                    className={getCharacterCounterColor(
                      contentCount,
                      MAX_CONTENT_CHARACTERS
                    )}
                  >
                    {contentCount}/{MAX_CONTENT_CHARACTERS}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BlogCreateForm
