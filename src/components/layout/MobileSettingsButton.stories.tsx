import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import MobileSettingsButton from '@/components/layout/MobileSettingsButton'

const meta = {
  title: 'Layouts/Mobile/MobileSettingsButton',
  component: MobileSettingsButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  args: {
    onClick: fn()
  },
  decorators: [
    (Story) => (
      <div className={cn('min-h-[280px]', appShellPageWashClassName)}>
        <div className="mx-auto max-w-2xl border-b border-neutral-200/80 py-2.5">
          <div className="flex items-start gap-3">
            <Story />
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="truncate text-base font-semibold text-gray-900">
                Account
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                Manage sign-in details for your Wraglet account.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  ]
} satisfies Meta<typeof MobileSettingsButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
