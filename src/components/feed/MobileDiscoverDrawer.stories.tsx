import { useEffect, useState } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { storybookDiscoverDrawerUsers } from '@/data/storybookUsers'
import MobileDiscoverDrawer from '@/components/feed/MobileDiscoverDrawer'

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

const demoUsers = storybookDiscoverDrawerUsers

const meta = {
  title: 'Features/Feed/MobileDiscoverDrawer',
  component: MobileDiscoverDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  args: {
    isOpen: true,
    onClose: fn(),
    otherUsers: demoUsers
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = globalThis.fetch
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              followersCount: 4,
              followingCount: 2,
              isFollowing: false,
              success: true
            }),
            { status: 200 }
          )

        return () => {
          globalThis.fetch = originalFetch
        }
      }, [])

      return (
        <div
          className={cn(
            'storybook-force-mobile min-h-[560px]',
            appShellPageWashClassName
          )}
        >
          <style>{mobileOnlyOverride}</style>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof MobileDiscoverDrawer>

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
            Open Discover Drawer
          </button>
        </div>
        <MobileDiscoverDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          otherUsers={demoUsers}
        />
      </>
    )
  }
}

export const Empty: Story = {
  args: {
    otherUsers: []
  }
}
