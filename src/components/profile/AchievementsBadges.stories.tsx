import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import AchievementsBadges from '@/components/profile/AchievementsBadges'

const meta = {
  title: 'Features/Profile/AchievementsBadges',
  component: AchievementsBadges,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-xl bg-white shadow">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof AchievementsBadges>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
