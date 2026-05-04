import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import PostImages from '@/components/feed/PostImages'

const imageA =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='white'>Image A</text></svg>"
const imageB =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><rect width='100%25' height='100%25' fill='%2342BBFF'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='48' fill='white'>Image B</text></svg>"

const meta = {
  title: 'Features/Feed/PostImages',
  component: PostImages,
  tags: ['autodocs'],
  args: {
    images: [{ key: 'a', url: imageA }]
  }
} satisfies Meta<typeof PostImages>

export default meta

type Story = StoryObj<typeof meta>

export const SingleImage: Story = {}

export const MultipleImages: Story = {
  args: {
    images: [
      { key: 'a', url: imageA },
      { key: 'b', url: imageB }
    ]
  }
}
