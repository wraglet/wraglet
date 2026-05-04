import { useEffect } from 'react'
import { appHeaderGradientClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storybookZustandUserPrimary } from '@/data/storybookUsers'
import AvatarMenu from '@/components/shared/AvatarMenu'

const demoUser = storybookZustandUserPrimary()

const meta = {
  title: 'UI Components/Avatar/AvatarMenu',
  component: AvatarMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        useUserStore.getState().setUser(demoUser)
        return () => useUserStore.getState().clearUser()
      }, [])

      return (
        <div
          className={cn(
            'flex justify-center p-4 shadow-sm',
            appHeaderGradientClassName
          )}
        >
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof AvatarMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
