import { withChatFloaterColumn } from '@/lib/storybookDecorators'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { storybookChatFloaterDemoConversations } from '@/data/storybookUsers'
import ChatFloaterRecentPanel from '@/components/chat/ChatFloaterRecentPanel'

const demoConversations = storybookChatFloaterDemoConversations

const meta = {
  title: 'Features/Chat/ChatFloaterRecentPanel',
  component: ChatFloaterRecentPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renders **inside** `ChatFloater`’s fixed column (`withChatFloaterColumn` from `@/lib/storybookDecorators`, matching `ChatFloater.tsx`).'
      }
    }
  },
  args: {
    conversations: demoConversations,
    minimizedIds: new Set(['conversation-2']),
    currentUserId: 'user-current',
    onOpenConversation: fn(),
    onAddChat: fn()
  },
  decorators: [withChatFloaterColumn]
} satisfies Meta<typeof ChatFloaterRecentPanel>

export default meta

type Story = StoryObj<typeof meta>

export const RecentThreads: Story = {}

export const Empty: Story = {
  args: {
    conversations: [],
    minimizedIds: new Set()
  }
}
