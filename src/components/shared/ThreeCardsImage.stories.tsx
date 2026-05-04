import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import ThreeCardsImage from '@/components/shared/ThreeCardsImage'

const meta = {
  title: 'UI Components/Illustrations/ThreeCardsImage',
  component: ThreeCardsImage,
  tags: ['autodocs']
} satisfies Meta<typeof ThreeCardsImage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
