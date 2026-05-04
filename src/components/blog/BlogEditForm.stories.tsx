import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import {
  STORYBOOK_BLOG_COVER_GRADIENT,
  storybookAuthorPrimary
} from '@/data/storybookUsers'
import BlogEditForm from '@/components/blog/BlogEditForm'

const demoBlog = {
  _id: 'blog-1',
  title: 'Building a Design-First Storybook',
  slug: 'design-first-storybook',
  summary:
    'How Wraglet keeps UI primitives and feature compositions aligned with production usage.',
  category: 'Design',
  tags: ['storybook', 'design-system'],
  status: 'draft' as const,
  coverImage: {
    url: STORYBOOK_BLOG_COVER_GRADIENT,
    key: 'cover'
  },
  contentBlocks: [
    {
      id: 'block-1',
      type: 'text' as const,
      content:
        '<p>Storybook should describe real app behavior, not a separate design fantasy.</p>',
      order: 0
    }
  ],
  author: storybookAuthorPrimary,
  reactions: [],
  comments: [],
  likes: 0,
  views: 0,
  readTime: 3,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date('2026-01-02').toISOString()
}

const meta = {
  title: 'Features/Blog/BlogEditForm',
  component: BlogEditForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    blog: demoBlog,
    onSuccess: fn()
  },
  decorators: [
    (Story) => (
      <div className={cn('min-h-screen p-6', appShellPageWashClassName)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof BlogEditForm>

export default meta

type Story = StoryObj<typeof meta>

export const Draft: Story = {}
