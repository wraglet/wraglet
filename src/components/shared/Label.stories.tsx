import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Label } from '@/components/shared/Label'

const meta = {
  title: 'UI Components/Forms/Label',
  component: Label,
  tags: ['autodocs']
} satisfies Meta<typeof Label>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="name">Name</Label>
      <input
        id="name"
        className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        placeholder="Type your name"
      />
    </div>
  )
}
