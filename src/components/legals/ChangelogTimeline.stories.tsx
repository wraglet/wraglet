import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ChangelogTimeline } from '@/components/legals/ChangelogTimeline'

const meta = {
  title: 'Compositions/Timeline/ChangelogTimeline',
  component: ChangelogTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ChangelogTimeline>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
