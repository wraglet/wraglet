import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/user'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import {
  STORYBOOK_AVATAR_UPLOAD_PREVIEW,
  storybookZustandUserPrimary
} from '@/data/storybookUsers'
import UploadProfilePicture from '@/components/profile/UploadProfilePicture'

const meta = {
  title: 'Features/Profile/UploadProfilePicture',
  component: UploadProfilePicture,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    profilePicture: STORYBOOK_AVATAR_UPLOAD_PREVIEW,
    show: true,
    close: fn(),
    setProfilePicture: fn()
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        useUserStore.getState().setUser(storybookZustandUserPrimary())

        return () => useUserStore.getState().clearUser()
      }, [])

      return (
        <div className={cn('min-h-[620px]', appShellPageWashClassName)}>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof UploadProfilePicture>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}
