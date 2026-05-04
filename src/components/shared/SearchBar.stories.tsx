import { appHeaderGradientClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import SearchBar from '@/components/shared/SearchBar'

const meta = {
  title: 'UI Components/Input/SearchBar',
  component: SearchBar,
  tags: ['autodocs']
} satisfies Meta<typeof SearchBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="w-[520px] rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <Story />
      </div>
    )
  ]
}

export const HeaderChrome: Story = {
  args: {
    variant: 'header',
    className: 'w-full max-w-xl'
  },
  decorators: [
    (Story) => (
      <div
        className={cn(
          'w-[min(100%,42rem)] rounded-b-xl border-b border-white/15 px-4 py-3 shadow-[0_4px_20px_-6px_rgba(14,165,233,0.45)]',
          appHeaderGradientClassName
        )}
      >
        <div className="mx-auto flex max-w-2xl justify-center">
          <Story />
        </div>
      </div>
    )
  ]
}
