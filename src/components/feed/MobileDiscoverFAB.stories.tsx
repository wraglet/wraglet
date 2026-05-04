import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import MobileDiscoverFAB from '@/components/feed/MobileDiscoverFAB'

const meta = {
  title: 'Features/Feed/MobileDiscoverFAB',
  component: MobileDiscoverFAB,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        component:
          'Fixed above the mobile tab bar via `mobileFabStackBottomClassName`; same horizontal slot as the profile photo FAB (`mobileFabSecondaryRightClassName`).'
      }
    }
  },
  args: {
    onClick: fn()
  },
  decorators: [
    (Story) => (
      <div className={cn('relative min-h-[520px]', appShellPageWashClassName)}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof MobileDiscoverFAB>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
