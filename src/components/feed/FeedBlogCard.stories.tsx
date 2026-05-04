import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  storybookIBlogFeedCompact,
  storybookIBlogPublishedSample
} from '@/data/storybookUsers'
import FeedBlogCard from '@/components/feed/FeedBlogCard'

const meta = {
  title: 'Features/Feed/FeedBlogCard',
  component: FeedBlogCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  decorators: [
    (Story) => (
      <div
        className={cn('mx-auto w-full max-w-xl p-4', appShellPageWashClassName)}
      >
        <Story />
      </div>
    )
  ],
  args: {
    blog: storybookIBlogPublishedSample
  }
} satisfies Meta<typeof FeedBlogCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CompactNoCover: Story = {
  args: {
    blog: storybookIBlogFeedCompact
  }
}
