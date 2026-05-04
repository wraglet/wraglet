import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storybookAuthorNonbinaryPeer } from '@/data/storybookUsers'
import Comment from '@/components/feed/Comment'

const baseComment = {
  _id: 'c1',
  content: 'This is a great post. Love the design direction.',
  author: storybookAuthorNonbinaryPeer,
  post: 'p1',
  createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
}

const meta = {
  title: 'Features/Feed/Comment',
  component: Comment,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  args: {
    comment: baseComment
  }
} satisfies Meta<typeof Comment>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="mx-auto w-full max-w-xl">
      <Comment {...args} />
    </div>
  )
}

export const LongContent: Story = {
  args: {
    comment: {
      ...baseComment,
      _id: 'c2',
      content:
        'Really thoughtful breakdown. The typography and spacing decisions feel intentional, and the visual hierarchy is clear even on small screens.'
    }
  },
  render: (args) => (
    <div className="mx-auto w-full max-w-xl">
      <Comment {...args} />
    </div>
  )
}
