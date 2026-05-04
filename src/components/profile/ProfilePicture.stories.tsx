import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  STORYBOOK_AVATAR_UPLOAD_PREVIEW,
  STORYBOOK_USERNAME
} from '@/data/storybookUsers'
import ProfilePicture from '@/components/profile/ProfilePicture'

const meta = {
  title: 'Features/Profile/ProfilePicture',
  component: ProfilePicture,
  tags: ['autodocs'],
  args: {
    username: STORYBOOK_USERNAME.PRIMARY,
    userGender: 'Male',
    userProfilePictureUrl: STORYBOOK_AVATAR_UPLOAD_PREVIEW,
    isCurrentUser: false
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ProfilePicture>

export default meta

type Story = StoryObj<typeof meta>

export const VisitorView: Story = {}

export const CurrentUserView: Story = {
  args: {
    isCurrentUser: true
  }
}
