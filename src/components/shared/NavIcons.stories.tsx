import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  BellIcon,
  ChatIcon,
  HomeIcon,
  PeopleIcon
} from '@/components/shared/NavIcons'

const meta = {
  title: 'UI Components/Icons/NavIcons',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-slate-500">
      <HomeIcon className="h-5 w-5" />
      <PeopleIcon className="h-5 w-5" />
      <ChatIcon className="h-5 w-5" />
      <BellIcon className="h-5 w-5" />
    </div>
  )
}
