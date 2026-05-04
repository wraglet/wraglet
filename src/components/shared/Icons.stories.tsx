import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  AllIcon,
  BlogIcon,
  BlogOutlineIcon,
  EventsIcon,
  GalleryIcon,
  PlayIcon,
  Post,
  ShareIcon,
  TerminalIcon,
  VideoIcon
} from '@/components/shared/Icons'

const meta = {
  title: 'UI Components/Icons/GeneralIcons',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-5 gap-6 text-gray-700">
      <BlogIcon className="h-6 w-6" />
      <BlogOutlineIcon className="h-6 w-6" />
      <Post className="h-6 w-6" />
      <PlayIcon className="h-6 w-6" />
      <GalleryIcon className="h-6 w-6" />
      <TerminalIcon className="h-6 w-6" />
      <ShareIcon className="h-6 w-6" />
      <VideoIcon className="h-6 w-6" />
      <AllIcon className="h-6 w-6" />
      <EventsIcon className="h-6 w-6" />
    </div>
  )
}
