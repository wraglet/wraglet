import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { storybookZustandUserPrimary } from '@/data/storybookUsers'
import CreatePost from '@/components/feed/CreatePost'

const demoUser = storybookZustandUserPrimary()

const demoImageDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%230EA5E9'/><stop offset='1' stop-color='%2342BBFF'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='54' fill='white'>Post Image</text></svg>"

const ControlledCreatePost = ({
  initialText = '',
  initialPostImage = null,
  isLoading = false
}: {
  initialText?: string
  initialPostImage?: string | null
  isLoading?: boolean
}) => {
  const [text, setText] = useState(initialText)
  const [postImage, setPostImage] = useState<string | null>(initialPostImage)

  useEffect(() => {
    useUserStore.getState().setUser(demoUser)
    return () => useUserStore.getState().clearUser()
  }, [])

  return (
    <CreatePost
      text={text}
      postImage={postImage}
      isLoading={isLoading}
      submitPost={async (event: FormEvent) => {
        event.preventDefault()
        fn()()
      }}
      setText={(event: ChangeEvent<HTMLTextAreaElement>) =>
        setText(event.target.value)
      }
      setPostImage={(image) => setPostImage(image)}
    />
  )
}

const meta = {
  title: 'Features/Feed/CreatePost',
  component: ControlledCreatePost,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  },
  decorators: [
    (Story) => (
      <div className={cn(appShellPageWashClassName, 'py-6')}>
        <div className="mx-auto w-full max-w-2xl px-3">
          <Story />
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof ControlledCreatePost>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {}
}

export const WithText: Story = {
  args: {
    initialText: 'Shipping a Storybook-first component pass today.'
  }
}

export const WithImage: Story = {
  args: {
    initialText: 'Here is a quick design preview.',
    initialPostImage: demoImageDataUri
  }
}

export const Loading: Story = {
  args: {
    initialText: 'Posting this update...',
    isLoading: true
  }
}
