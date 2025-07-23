'use client'

import { FormEvent, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Bars3Icon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
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

// Dynamic import for TipTap to avoid SSR issues
const TipTapEditor = dynamic(() => Promise.resolve(EditorContent), {
  ssr: false
})

// Blog constants
const MAX_TITLE_CHARACTERS = 200
const MAX_SUMMARY_CHARACTERS = 500
const MAX_CONTENT_CHARACTERS = 50000

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
  order: number
  metadata?: {
    language?: string // for code blocks
    caption?: string // for images/videos
    url?: string // for images/videos
    alt?: string // for images
  }
}

interface BlogCreateFormProps {
  onSuccess?: () => void
}

const BlogCreateForm = ({ onSuccess }: BlogCreateFormProps = {}) => {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'text', content: '', order: 0 }
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Character counts
  const titleCount = title.length
  const summaryCount = summary.length
  const contentCount = contentBlocks
    .filter((block) => block.type === 'text')
    .reduce((acc, block) => acc + (block.content?.length || 0), 0)

  // Validation
  const isOverTitleLimit = titleCount > MAX_TITLE_CHARACTERS
  const isOverSummaryLimit = summaryCount > MAX_SUMMARY_CHARACTERS
  const isOverContentLimit = contentCount > MAX_CONTENT_CHARACTERS
  const canSubmit =
    title.trim() &&
    summary.trim() &&
    contentBlocks.some((block) => block.content.trim()) &&
    !isOverTitleLimit &&
    !isOverSummaryLimit &&
    !isOverContentLimit

  // Add content block
  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      order: contentBlocks.length,
      ...(type === 'code' && { metadata: { language: 'javascript' } })
    }
    setContentBlocks([...contentBlocks, newBlock])
  }

  // Remove content block
  const removeContentBlock = (id: string) => {
    const filteredBlocks = contentBlocks.filter((block) => block.id !== id)
    // Reorder remaining blocks
    const reorderedBlocks = filteredBlocks.map((block, index) => ({
      ...block,
      order: index
    }))
    setContentBlocks(reorderedBlocks)
  }

  // Update content block
  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(
      contentBlocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    )
  }

  // Move block up/down
  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...contentBlocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }))
    setContentBlocks(reorderedBlocks)
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
        content: contentBlocks
          .filter((block) => block.content.trim())
          .map((block) => block.content)
          .join('\n\n'),
        category,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        coverImageUrl: coverImageUrl || undefined,
        status,
        contentBlocks: contentBlocks.filter((block) => block.content.trim())
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
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 pr-16 shadow-sm">
        <h1 className="text-lg font-medium text-gray-900">Create New Blog</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as FormEvent)
            }
            disabled={!canSubmit || isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              status === 'published'
                ? 'bg-sky-500 text-white hover:bg-sky-600 disabled:bg-gray-300'
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

      {/* Main Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none ${
                  isOverTitleLimit
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-neutral-200 focus:border-sky-500 focus:ring-sky-500'
                }`}
                placeholder="Enter an engaging blog title..."
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className={`h-24 w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none ${
                    isOverSummaryLimit
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-neutral-200 focus:border-sky-500 focus:ring-sky-500'
                  }`}
                  placeholder="Write a compelling summary that captures your blog's essence..."
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
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="technology, programming, web development..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate tags with commas
                </p>
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
                  className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="https://example.com/your-cover-image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: Add a cover image to make your blog more engaging
              </p>
            </div>

            {/* Content Blocks */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-700">
                    Content Blocks
                  </h2>
                  <p className="text-xs text-gray-500">
                    Build your blog with different content types
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addContentBlock('text')}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-neutral-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-3 w-3" />
                    📝 Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('code')}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-neutral-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-3 w-3" />
                    💻 Code
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('image')}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-neutral-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-3 w-3" />
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => addContentBlock('video')}
                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-neutral-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-3 w-3" />
                    🎥 Video
                  </button>
                </div>
              </div>

              {/* Content Blocks List */}
              <div className="space-y-4">
                {contentBlocks.map((block, index) => (
                  <ContentBlockEditor
                    key={block.id}
                    block={block}
                    index={index}
                    onUpdate={(updates) =>
                      updateContentBlock(block.id, updates)
                    }
                    onRemove={() => removeContentBlock(block.id)}
                    onMoveUp={
                      index > 0 ? () => moveBlock(index, index - 1) : undefined
                    }
                    onMoveDown={
                      index < contentBlocks.length - 1
                        ? () => moveBlock(index, index + 1)
                        : undefined
                    }
                  />
                ))}
              </div>

              {contentBlocks.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-gray-50 py-12 text-center">
                  <div className="mb-3 text-4xl">📝</div>
                  <p className="mb-2 text-sm text-gray-500">
                    No content blocks yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Add your first block to start writing!
                  </p>
                </div>
              )}
            </div>

            {/* Content Character Count */}
            <div className="flex justify-end">
              <span
                className={`text-xs ${getCharacterCounterColor(
                  contentCount,
                  MAX_CONTENT_CHARACTERS
                )}`}
              >
                Total Content: {contentCount.toLocaleString()}/
                {MAX_CONTENT_CHARACTERS.toLocaleString()}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Content Block Editor Component
interface ContentBlockEditorProps {
  block: ContentBlock
  index: number
  onUpdate: (updates: Partial<ContentBlock>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

const ContentBlockEditor = ({
  block,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}: ContentBlockEditorProps) => {
  // TipTap editor for text blocks
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sky-600 hover:text-sky-800 underline'
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
    content: block.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() })
    }
  })

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'code':
        return '💻'
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      default:
        return '📄'
    }
  }

  const getBlockTitle = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text':
        return 'Text Block'
      case 'code':
        return 'Code Block'
      case 'image':
        return 'Image Block'
      case 'video':
        return 'Video Block'
      default:
        return 'Content Block'
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Block Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-neutral-200 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <Bars3Icon className="h-4 w-4 cursor-move text-gray-400" />
          <span className="text-lg">{getBlockIcon(block.type)}</span>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {getBlockTitle(block.type)} {index + 1}
            </span>
            {block.type === 'text' && (
              <p className="text-xs text-gray-500">
                Rich text editor with formatting options
              </p>
            )}
            {block.type === 'code' && (
              <p className="text-xs text-gray-500">
                Syntax highlighted code snippets
              </p>
            )}
            {block.type === 'image' && (
              <p className="text-xs text-gray-500">
                Images with captions and alt text
              </p>
            )}
            {block.type === 'video' && (
              <p className="text-xs text-gray-500">
                Video embeds with captions
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Move up"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Move down"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Remove block"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4">
        {block.type === 'text' && (
          <div className="rounded-lg border border-neutral-200">
            {/* Toolbar */}
            {editor && (
              <div className="rounded-t-lg border-b border-neutral-200 bg-gray-50 p-3">
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('bold')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('italic')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('underline')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Underline
                  </button>
                  <div className="mx-1 w-px bg-neutral-300"></div>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('heading', { level: 1 })
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('heading', { level: 2 })
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('heading', { level: 3 })
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    H3
                  </button>
                  <div className="mx-1 w-px bg-neutral-300"></div>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('bulletList')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('orderedList')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('blockquote')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editor.isActive('codeBlock')
                        ? 'bg-sky-500 text-white'
                        : 'border border-neutral-200 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Code
                  </button>
                </div>
              </div>
            )}
            {/* Editor Content */}
            <div className="rounded-b-lg bg-white p-4">
              {editor ? (
                <TipTapEditor
                  editor={editor}
                  className="prose prose-sm min-h-[200px] max-w-none focus:outline-none [&_blockquote]:border-l-4 [&_blockquote]:border-sky-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_ol]:text-sm [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:text-sm"
                />
              ) : (
                <div className="flex min-h-[200px] items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-b-2 border-sky-500"></div>
                    <p className="text-sm">Loading editor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {block.type === 'code' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Language
              </label>
              <input
                type="text"
                value={block.metadata?.language || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, language: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="javascript, python, html, css..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Code
              </label>
              <textarea
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full rounded border border-neutral-200 bg-gray-900 p-3 font-mono text-sm leading-relaxed text-gray-100"
                rows={12}
                placeholder="Enter your code here..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Caption (optional)
              </label>
              <input
                type="text"
                value={block.metadata?.caption || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, caption: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Describe what this code does..."
              />
            </div>
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                value={block.metadata?.url || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, url: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Alt Text
              </label>
              <input
                type="text"
                value={block.metadata?.alt || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, alt: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Describe the image for accessibility..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Caption (optional)
              </label>
              <input
                type="text"
                value={block.metadata?.caption || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, caption: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Add a caption for this image..."
              />
            </div>
            {block.metadata?.url && (
              <div className="mt-3 rounded-lg border border-neutral-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs text-gray-600">Preview:</p>
                <img
                  src={block.metadata.url}
                  alt={block.metadata.alt || 'Preview'}
                  className="h-auto max-w-full rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Video URL
              </label>
              <input
                type="url"
                value={block.metadata?.url || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, url: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Caption (optional)
              </label>
              <input
                type="text"
                value={block.metadata?.caption || ''}
                onChange={(e) =>
                  onUpdate({
                    metadata: { ...block.metadata, caption: e.target.value }
                  })
                }
                className="w-full rounded border border-neutral-200 p-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="Describe what this video is about..."
              />
            </div>
            {block.metadata?.url && (
              <div className="mt-3 rounded-lg border border-neutral-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs text-gray-600">Video URL:</p>
                <div className="flex aspect-video items-center justify-center rounded-lg border bg-neutral-100">
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🎥</div>
                    <p className="text-xs text-gray-500">
                      Video: {block.metadata.url}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogCreateForm
