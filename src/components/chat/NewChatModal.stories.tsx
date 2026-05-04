import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { storybookNewChatModalUsers } from '@/data/storybookUsers'
import { NewChatModal } from '@/components/chat/NewChatModal'

const demoUsers = [...storybookNewChatModalUsers]

const meta = {
  title: 'Features/Chat/NewChatModal',
  component: NewChatModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    open: true,
    onClose: fn(),
    onSelectUser: fn(),
    users: demoUsers,
    isLoading: false,
    error: null
  }
} satisfies Meta<typeof NewChatModal>

export default meta

type Story = StoryObj<typeof meta>

export const Wraglet: Story = {}

export const Loading: Story = {
  args: {
    isLoading: true,
    users: []
  }
}

export const ErrorState: Story = {
  args: {
    error: 'Unable to load users right now.',
    users: []
  }
}
