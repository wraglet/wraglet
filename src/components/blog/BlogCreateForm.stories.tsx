import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import BlogCreateForm from '@/components/blog/BlogCreateForm'

const meta = {
  title: 'Features/Blog/BlogCreateForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <div className={cn('min-h-screen p-6', appShellPageWashClassName)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <BlogCreateForm onSuccess={fn()} />
}
