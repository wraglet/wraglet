import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import BlogPreviewCard from '@/components/feed/BlogPreviewCard'

const demoCoverDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%2342BBFF'/><stop offset='1' stop-color='%230EA5E9'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='54' fill='white'>Wraglet Blog</text></svg>"

const meta = {
  title: 'Features/Feed/BlogPreviewCard',
  component: BlogPreviewCard,
  tags: ['autodocs'],
  args: {
    blogPreview: {
      url: 'https://wraglet.com/blog/design-system',
      slug: 'design-system',
      title: 'Building a Design-First Storybook for Wraglet',
      summary:
        'How we organized components, tokens, and stories to improve consistency and shipping speed.',
      category: 'Design',
      coverImage: demoCoverDataUri
    }
  }
} satisfies Meta<typeof BlogPreviewCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoCoverImage: Story = {
  args: {
    blogPreview: {
      url: 'https://wraglet.com/blog/performance',
      slug: 'performance',
      title: 'Performance Checklist for Social Feed UIs',
      summary: 'A practical checklist to keep feed interactions smooth.',
      category: 'Engineering',
      coverImage: null
    }
  }
}
