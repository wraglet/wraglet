import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  STORYBOOK_USERNAME,
  storybookZustandUserPrimary
} from '@/data/storybookUsers'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const demoUser = storybookZustandUserPrimary()

const meta = {
  title: 'Layouts/Mobile/MobileBottomNav',
  component: MobileBottomNav,
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
    },
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        useUserStore.getState().setUser(demoUser)
        return () => useUserStore.getState().clearUser()
      }, [])

      return (
        <div className={cn('min-h-[360px]', appShellPageWashClassName)}>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof MobileBottomNav>

export default meta

type Story = StoryObj<typeof meta>

export const FeedActive: Story = {}

export const BlogsTabActive: Story = {
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

export const VideosTabActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/feed',
        query: {
          tab: 'videos'
        }
      }
    }
  }
}

export const SettingsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/settings/profile'
      }
    }
  }
}

export const ProfileActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: `/${STORYBOOK_USERNAME.PRIMARY}`
      }
    }
  }
}
