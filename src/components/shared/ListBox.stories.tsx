import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import ListBox from '@/components/shared/ListBox'

const meta = {
  title: 'UI Components/Forms/ListBox',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const StringOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState('General')

    return (
      <div className="w-64">
        <ListBox
          label="Category"
          options={['General', 'Design', 'Engineering', 'Product']}
          selected={selected}
          setSelected={(value) => setSelected(value as string)}
        />
      </div>
    )
  }
}
