import { unauthenticatedShellBackdropClassName } from '@/lib/uiChrome'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import UnauthenticatedLayoutClient from '@/components/layout/UnauthenticatedLayoutClient'

const meta = {
  title: 'Layouts/Auth/UnauthenticatedLayoutClient',
  component: UnauthenticatedLayoutClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/'
      }
    }
  },
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-600">
          This mirrors the auth card shell used around login and signup forms.
        </p>
        <div className="h-10 rounded-full bg-[#E7ECF0]" />
        <div className="h-10 rounded-full bg-[#E7ECF0]" />
        <div className="h-10 rounded-full bg-[#0EA5E9]" />
      </div>
    )
  },
  decorators: [
    (Story) => (
      <div
        className={`flex min-h-[520px] items-center justify-center px-2 py-4 ${unauthenticatedShellBackdropClassName}`}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof UnauthenticatedLayoutClient>

export default meta

type Story = StoryObj<typeof meta>

export const LoginShell: Story = {}

export const RegisterShell: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/register'
      }
    }
  },
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-600">
          The register page uses the compact auth shell with scrollable content.
        </p>
        <div className="h-10 rounded-full bg-[#E7ECF0]" />
        <div className="h-10 rounded-full bg-[#E7ECF0]" />
        <div className="h-10 rounded-full bg-[#E7ECF0]" />
        <div className="h-10 rounded-full bg-[#0EA5E9]" />
      </div>
    )
  }
}
