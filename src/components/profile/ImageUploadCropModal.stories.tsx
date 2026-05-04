import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import ImageUploadCropModal from '@/components/profile/ImageUploadCropModal'

const demoImageDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%2342BBFF'/><stop offset='1' stop-color='%237C3AED'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='white'>Crop</text></svg>"

const meta = {
  title: 'Features/Profile/ImageUploadCropModal',
  component: ImageUploadCropModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    show: true,
    close: fn(),
    title: 'Upload Cover Photo',
    description: 'Choose an image, then crop it to match the profile header.',
    defaultImage: demoImageDataUri,
    image: demoImageDataUri,
    aspect: 16 / 6,
    cropShape: 'rect',
    previewStyle: 'rect',
    minWidth: 1600,
    minHeight: 600,
    onCrop: fn(),
    apiLabel: 'Save Cover Photo'
  },
  decorators: [
    (Story) => (
      <div className={cn('min-h-[620px]', appShellPageWashClassName)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ImageUploadCropModal>

export default meta

type Story = StoryObj<typeof meta>

export const CoverPhoto: Story = {}

export const RoundAvatar: Story = {
  args: {
    title: 'Upload Profile Picture',
    description: 'Choose a square image for your profile avatar.',
    aspect: 1,
    cropShape: 'round',
    previewStyle: 'circle',
    minWidth: 160,
    minHeight: 160,
    apiLabel: 'Save Profile Picture'
  }
}
