import { useEffect, useState } from 'react'
import type { IPost } from '@/models/Post'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as Ably from 'ably'
import { AblyProvider, ChannelProvider } from 'ably/react'
import { Toaster } from 'react-hot-toast'
import { fn } from 'storybook/test'

import {
  storybookAuthorPrimary,
  storybookZustandUserViewer
} from '@/data/storybookUsers'
import ShareModalWithAbly from '@/components/feed/ShareModalWithAbly'

const storybookAblyClient = new Ably.Realtime({
  autoConnect: false,
  clientId: 'storybook-share-modal',
  key: 'storybook:storybook'
})

const mockPost: IPost = {
  _id: 'post-123',
  content: {
    text: 'Building Wraglet with Storybook-first design tokens and reusable UI patterns.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop',
        key: 'story-image-1'
      }
    ]
  },
  audience: 'public',
  author: {
    ...storybookAuthorPrimary,
    _id: 'author-1'
  },
  reactions: [],
  votes: [],
  comments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const meta = {
  title: 'Features/Feed/ShareModalWithAbly',
  component: ShareModalWithAbly,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ShareModalWithAbly>

export default meta

type Story = StoryObj<typeof meta>

type ShareModalStoryArgs = {
  isOpen: boolean
  onClose: () => void
  post: IPost
  onShareToFeed?: () => void
}

const ShareModalOpenStory = (args: ShareModalStoryArgs) => {
  const [isOpen, setIsOpen] = useState(args.isOpen ?? true)

  return (
    <StoryDecorated>
      <ShareModalWithAbly
        {...args}
        isOpen={isOpen}
        onClose={() => {
          args.onClose?.()
          setIsOpen(false)
        }}
      />
    </StoryDecorated>
  )
}

const StoryDecorated = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    useUserStore.getState().setUser(storybookZustandUserViewer())
    return () => useUserStore.getState().clearUser()
  }, [])

  return (
    <AblyProvider client={storybookAblyClient}>
      <ChannelProvider channelName={`post-${mockPost._id}`}>
        <Toaster position="bottom-right" />
        {children}
      </ChannelProvider>
    </AblyProvider>
  )
}

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: fn(),
    post: mockPost
  },
  render: (args) => <ShareModalOpenStory {...args} />
}
