import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as Ably from 'ably'
import { AblyProvider } from 'ably/react'

import {
  storybookIBlogPublishedSample,
  storybookPublicUserNonbinaryPeer,
  storybookPublicUserPrimary
} from '@/data/storybookUsers'
import BlogDetail from '@/components/blog/BlogDetail'

const storybookAblyClient = new Ably.Realtime({
  autoConnect: false,
  clientId: 'storybook-blog-detail',
  key: 'storybook:storybook'
})

const demoUser = storybookPublicUserPrimary

const meta = {
  title: 'Features/Blog/BlogDetail',
  component: BlogDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    blog: storybookIBlogPublishedSample,
    currentUser: demoUser
  },
  decorators: [
    (Story) => (
      <AblyProvider client={storybookAblyClient}>
        <div
          className={cn('min-h-screen p-4 md:p-5', appShellPageWashClassName)}
        >
          <Story />
        </div>
      </AblyProvider>
    )
  ]
} satisfies Meta<typeof BlogDetail>

export default meta

type Story = StoryObj<typeof meta>

export const AuthorView: Story = {}

export const ReaderView: Story = {
  args: {
    currentUser: storybookPublicUserNonbinaryPeer
  }
}
