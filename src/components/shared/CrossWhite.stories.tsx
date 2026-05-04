import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import CrossWhite from '@/components/shared/CrossWhite'

const meta = {
  title: 'UI Components/Icons/CrossWhite',
  component: CrossWhite,
  tags: ['autodocs']
} satisfies Meta<typeof CrossWhite>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomColor: Story = {
  args: {
    fill: '#0EA5E9',
    fillColor: '#F3F4F6',
    w: '28',
    h: '28'
  }
}
