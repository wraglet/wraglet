import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { STORYBOOK_BLOG_COVER_GRADIENT } from '@/data/storybookUsers'
import BlogImageUpload from '@/components/blog/BlogImageUpload'

const meta = {
  title: 'Features/Blog/BlogImageUpload',
  component: BlogImageUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  args: {
    value: undefined,
    onChange: fn(),
    uploadType: 'cover',
    showPreview: true,
    placeholder: 'Upload a cover image for your blog...'
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-4 shadow">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof BlogImageUpload>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithPreview: Story = {
  args: {
    value: STORYBOOK_BLOG_COVER_GRADIENT
  }
}

export const ContentImage: Story = {
  args: {
    uploadType: 'content',
    placeholder: 'Add an inline image to this content block...'
  }
}
