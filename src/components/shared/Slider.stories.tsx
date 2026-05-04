import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Slider } from '@/components/shared/Slider'

const meta = {
  title: 'UI Components/Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: {
    defaultValue: [50],
    max: 100,
    step: 1
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RangeStart: Story = {
  args: {
    defaultValue: [10]
  }
}
