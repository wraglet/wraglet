import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storybookZustandUserPrimary } from '@/data/storybookUsers'
import LeftNav from '@/components/feed/LeftNav'

const demoUser = storybookZustandUserPrimary({
  profilePicture: undefined,
  pronoun: undefined
})

const meta = {
  title: 'Features/Feed/LeftNav',
  component: LeftNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/feed',
        query: {
          tab: 'all'
        }
      }
    }
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        useUserStore.getState().setUser(demoUser)
        return () => useUserStore.getState().clearUser()
      }, [])

      return (
        <div className={cn('min-h-[640px]', appShellPageWashClassName)}>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof LeftNav>

export default meta

type Story = StoryObj<typeof meta>

export const AllTab: Story = {}

export const BlogsTab: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/feed',
        query: {
          tab: 'blogs'
        }
      }
    }
  }
}
