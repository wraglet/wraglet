import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import Button from '@/components/shared/Button'

const meta = {
  title: 'UI Components/Button/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link'
      ]
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    }
  },
  args: {
    children: 'Continue',
    variant: 'default',
    size: 'default',
    onClick: fn()
  }
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
}

export const LinkStyle: Story = {
  args: {
    variant: 'link',
    children: 'Forgot Password?'
  }
}

export const SizeShowcase: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Close">
        X
      </Button>
    </div>
  )
}
