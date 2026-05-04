import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import AddPhotoModal from '@/components/profile/AddPhotoModal'

const demoPhotoDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%2342BBFF'/><stop offset='1' stop-color='%230EA5E9'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='56' fill='white'>Photo</text></svg>"

const meta = {
  title: 'Features/Profile/AddPhotoModal',
  component: AddPhotoModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    isOpen: true,
    onClose: fn(),
    onUpdatePhotos: fn(),
    existingPhotos: [
      {
        url: demoPhotoDataUri,
        key: 'photo-1',
        type: 'post',
        createdAt: new Date('2026-01-01').toISOString()
      },
      {
        url: demoPhotoDataUri,
        key: 'photo-2',
        type: 'avatar',
        createdAt: new Date('2026-01-02').toISOString()
      }
    ]
  }
} satisfies Meta<typeof AddPhotoModal>

export default meta

type Story = StoryObj<typeof meta>

export const ExistingPhotos: Story = {}

export const EmptyLibrary: Story = {
  args: {
    existingPhotos: []
  }
}
