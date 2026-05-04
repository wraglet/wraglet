import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import FloaterConversationAvatarButton from '@/components/chat/FloaterConversationAvatarButton'

const demoAvatarDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%25' height='100%25' fill='%2342BBFF'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='white'>M</text></svg>"

const meta = {
  title: 'Features/Chat/FloaterConversationAvatarButton',
  component: FloaterConversationAvatarButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Used in `ChatFloaterRecentPanel` on the app feed; hover tooltips match production.'
      }
    }
  },
  args: {
    name: 'Mika Chen',
    avatarUrl: demoAvatarDataUri,
    gender: 'Female',
    isGroup: false,
    groupInitials: 'MC',
    unreadCount: 3,
    onOpen: fn()
  }
} satisfies Meta<typeof FloaterConversationAvatarButton>

export default meta

type Story = StoryObj<typeof meta>

export const DirectMessage: Story = {}

export const Group: Story = {
  args: {
    name: 'Design Circle',
    avatarUrl: null,
    gender: 'Others',
    isGroup: true,
    groupInitials: 'DC',
    unreadCount: 12
  }
}

export const OverflowBadge: Story = {
  args: {
    unreadCount: 145
  }
}
