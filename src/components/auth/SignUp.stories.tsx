import { unauthenticatedShellBackdropClassName } from '@/lib/uiChrome'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import SignUp from '@/components/auth/SignUp'
import UnauthenticatedLayoutClient from '@/components/layout/UnauthenticatedLayoutClient'

const meta = {
  title: 'Features/Auth/SignUp',
  component: SignUp,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/register'
      }
    },
    docs: {
      description: {
        component:
          'Rendered inside `UnauthenticatedLayoutClient` with `/register` pathname so the shell matches production. Backdrop: `unauthenticatedShellBackdropClassName` from `@/lib/uiChrome`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div
        className={`flex min-h-[520px] items-center justify-center px-2 py-4 ${unauthenticatedShellBackdropClassName}`}
      >
        <UnauthenticatedLayoutClient>
          <Story />
        </UnauthenticatedLayoutClient>
      </div>
    )
  ]
} satisfies Meta<typeof SignUp>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
