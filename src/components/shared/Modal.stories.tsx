import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import Button from '@/components/shared/Button'
import Modal from '@/components/shared/Modal'

const meta = {
  title: 'UI Components/Feedback/Modal',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div>
        <Button
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
          onClick={() => setIsOpen(true)}
        >
          Open modal
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete post?"
        >
          <div className="space-y-3 p-5">
            <p className="text-sm text-gray-700">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white">
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
