import { useState } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import MobileSettingsDrawer from '@/components/layout/MobileSettingsDrawer'

const mobileOnlyOverride = `
  @media (min-width: 1024px) {
    .storybook-force-mobile .lg\\:hidden {
      display: block !important;
    }

    .storybook-force-mobile button.lg\\:hidden,
    .storybook-force-mobile .flex.lg\\:hidden {
      display: flex !important;
    }
  }
`

const meta = {
  title: 'Layouts/Mobile/MobileSettingsDrawer',
  component: MobileSettingsDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      navigation: {
        pathname: '/settings/profile'
      }
    },
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  args: {
    isOpen: true,
    onClose: fn()
  },
  decorators: [
    (Story) => (
      <div
        className={cn(
          'storybook-force-mobile min-h-[520px]',
          appShellPageWashClassName
        )}
      >
        <style>{mobileOnlyOverride}</style>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof MobileSettingsDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        <div className="p-6">
          <button
            type="button"
            className="rounded-full bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={() => setIsOpen(true)}
          >
            Open Settings Drawer
          </button>
        </div>
        <MobileSettingsDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    )
  }
}

export const Closed: Story = {
  args: {
    isOpen: false
  },
  decorators: [
    (Story) => (
      <div className="p-6 text-sm text-neutral-600">
        The drawer is mounted off-canvas until the settings button opens it.
        <Story />
      </div>
    )
  ]
}
