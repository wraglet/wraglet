import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import ProfilePictureHover from '@/components/profile/ProfilePictureHover'

const demoAvatarDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='120' fill='white'>J</text></svg>"

const meta = {
  title: 'Features/Profile/ProfilePictureHover',
  component: ProfilePictureHover,
  tags: ['autodocs'],
  args: {
    profilePicture: demoAvatarDataUri
  },
  decorators: [
    (Story) => (
      <div className="group relative h-40 w-40 rounded-full bg-neutral-200">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ProfilePictureHover>

export default meta

type Story = StoryObj<typeof meta>

export const CameraButton: Story = {}
