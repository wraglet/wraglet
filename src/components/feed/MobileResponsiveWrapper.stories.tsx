import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { storybookDiscoverUserNonbinaryPeer } from '@/data/storybookUsers'
import MobileResponsiveWrapper from '@/components/feed/MobileResponsiveWrapper'

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

const demoUsers = [storybookDiscoverUserNonbinaryPeer]

const meta = {
  title: 'Features/Feed/MobileResponsiveWrapper',
  component: MobileResponsiveWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  args: {
    otherUsers: demoUsers
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = globalThis.fetch
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              followersCount: 0,
              followingCount: 0,
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
            'storybook-force-mobile min-h-[520px]',
            appShellPageWashClassName
          )}
        >
          <style>{mobileOnlyOverride}</style>
          <div className="p-6 text-sm text-neutral-600">
            Click the floating discover button in the bottom-right area to open
            the drawer.
          </div>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof MobileResponsiveWrapper>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}
