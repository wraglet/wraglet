import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import BirthdayPicker from '@/components/shared/BirthdayPicker'

const meta = {
  title: 'Compositions/Forms/BirthdayPicker',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded'
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState(new Date('2000-01-15'))

    return (
      <div className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-6">
        <BirthdayPicker date={date} dateSetter={setDate} />
        <p className="mt-3 text-sm text-gray-600">
          Selected: {date.toDateString()}
        </p>
      </div>
    )
  }
}
