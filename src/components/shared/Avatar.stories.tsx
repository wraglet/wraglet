import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import Avatar from '@/components/shared/Avatar'

const demoAvatarDataUri =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='50%25' text-anchor='middle' dominant-baseline='central' dy='0.03em' font-family='Arial' font-size='56' fill='white'>W</text></svg>"

const meta = {
  title: 'UI Components/Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  },
  args: {
    gender: 'Others',
    src: demoAvatarDataUri,
    alt: 'Demo avatar'
  }
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: {
    size: 'h-6 w-6'
  }
}

export const Large: Story = {
  args: {
    size: 'h-16 w-16'
  }
}
