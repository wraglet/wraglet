import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import UploadCoverPhoto from '@/components/profile/UploadCoverPhoto'

const demoCoverDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%230EA5E9'/><stop offset='1' stop-color='%237C3AED'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='72' fill='white'>Cover Photo</text></svg>"

const meta = {
  title: 'Features/Profile/UploadCoverPhoto',
  component: UploadCoverPhoto,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    coverPhoto: demoCoverDataUri,
    show: true,
    close: fn(),
    setCoverPhoto: fn()
  },
  decorators: [
    (Story) => (
      <div className={cn('min-h-[620px]', appShellPageWashClassName)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof UploadCoverPhoto>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}
