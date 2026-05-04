import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Skeleton } from '@/components/shared/Skeleton'

const meta = {
  title: 'UI Components/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs']
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const CardPlaceholder: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
