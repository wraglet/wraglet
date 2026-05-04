import { authFormInputClassName } from '@/lib/authFormInputClassName'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import Input from '@/components/shared/Input'

const meta = {
  title: 'UI Components/Input/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'For `type="password"`, masked state uses `type="text"` plus `-webkit-text-security: disc` when supported (Chrome, Edge, Safari) so the browser never injects a second reveal control; otherwise falls back to `type="password"` with UA reveal suppressed. Do not pass a trailing `icon` on password fields.'
      }
    }
  },
  args: {
    label: 'Email',
    placeholder: 'you@wraglet.com',
    type: 'email'
  }
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password'
  },
  parameters: {
    docs: {
      description: {
        story:
          'One visibility toggle. In Chromium-based browsers the field is masked with `-webkit-text-security` (not `type=password`) so native reveal UI never appears; Edge `::-ms-reveal` is also forced off in global CSS.'
      }
    }
  }
}

export const AsInAuthForms: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@wraglet.com',
    className: authFormInputClassName
  }
}
