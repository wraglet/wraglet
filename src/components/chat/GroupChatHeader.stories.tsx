import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storybookGroupChatParticipants } from '@/data/storybookUsers'
import GroupChatHeader from '@/components/chat/GroupChatHeader'

const participants = [...storybookGroupChatParticipants]

const meta = {
  title: 'Features/Chat/GroupChatHeader',
  component: GroupChatHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    participants,
    isGroup: true
  },
  decorators: [
    (Story) => (
      <div className="min-h-[180px] bg-white">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof GroupChatHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Group: Story = {}

export const DirectMessage: Story = {
  args: {
    participants: [participants[0]],
    isGroup: false
  }
}
