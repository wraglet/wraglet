import { unauthenticatedShellBackdropClassName } from '@/lib/uiChrome'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import LoginForm from '@/components/auth/LoginForm'
import UnauthenticatedLayoutClient from '@/components/layout/UnauthenticatedLayoutClient'

const meta = {
  title: 'Features/Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/'
      }
    },
    docs: {
      description: {
        component:
          'Rendered inside `UnauthenticatedLayoutClient` as on the live login route (`(unauthenticated)/page.tsx`). Backdrop: `unauthenticatedShellBackdropClassName` from `@/lib/uiChrome` (same as `(unauthenticated)/layout.tsx`).'
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
} satisfies Meta<typeof LoginForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
