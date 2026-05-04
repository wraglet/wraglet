import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import Checkbox from '@/components/shared/Checkbox'

const meta = {
  title: 'UI Components/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    id: 'terms',
    label: 'Accept terms',
    onChange: fn()
  }
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    defaultChecked: true
  }
}
