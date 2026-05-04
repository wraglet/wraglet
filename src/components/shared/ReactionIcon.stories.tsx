import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import ReactionIcon from '@/components/shared/ReactionIcon'

const meta = {
  title: 'UI Components/Icons/ReactionIcon',
  component: ReactionIcon,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
    }
  },
  args: {
    type: 'love',
    onClick: async () => {}
  }
} satisfies Meta<typeof ReactionIcon>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
