import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import CoverPhotoHover from '@/components/profile/CoverPhotoHover'

const demoCoverDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='600'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='white'>Cover</text></svg>"

const meta = {
  title: 'Features/Profile/CoverPhotoHover',
  component: CoverPhotoHover,
  tags: ['autodocs'],
  args: {
    coverPhoto: demoCoverDataUri
  },
  decorators: [
    (Story) => (
      <div className="group relative h-48 w-full max-w-2xl rounded-xl bg-neutral-200">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof CoverPhotoHover>

export default meta

type Story = StoryObj<typeof meta>

export const CameraButton: Story = {}
