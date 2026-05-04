import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import MessageBody from '@/components/chat/MessageBody'

const demoMessages = [
  {
    _id: 'message-1',
    sender: {
      _id: 'user-2',
      firstName: 'Ashlynn',
      lastName: 'Milton',
      gender: 'Female' as const,
      profilePicture: null
    },
    content: 'hekki',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    _id: 'message-2',
    sender: {
      _id: 'user-primary',
      firstName: 'Jordan',
      lastName: 'Kim',
      gender: 'Male' as const,
      profilePicture: {
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='64' fill='white'>D</text></svg>"
      }
    },
    content: 'hi',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    _id: 'message-3',
    sender: {
      _id: 'user-2',
      firstName: 'Ashlynn',
      lastName: 'Milton',
      gender: 'Female' as const,
      profilePicture: null
    },
    content: 'youw',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
]

const meta = {
  title: 'Features/Chat/MessageBody',
  component: MessageBody,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    selectedId: 'conversation-1',
    messages: demoMessages,
    currentUserId: 'user-1'
  },
  decorators: [
    (Story) => (
      <div className="flex h-[720px] max-w-3xl bg-white">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof MessageBody>

export default meta

type Story = StoryObj<typeof meta>

export const WithMessages: Story = {}

export const EmptyConversation: Story = {
  args: {
    messages: []
  }
}

export const NoConversationSelected: Story = {
  args: {
    selectedId: null,
    messages: []
  }
}
