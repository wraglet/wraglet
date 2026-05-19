import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import {
  buildRightNavActivitiesPayload,
  buildRightNavPostsPayload,
  buildRightNavTopicsTrendingPayload,
  jsonStoryResponse,
  rightNavStoryDiscoverUsers,
  rightNavStoryFetchPaths
} from '@/test/rightNavStoryFetchMocks'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import RightNav from '@/components/feed/RightNav'

const resolveFetchUrl = (input: Parameters<typeof fetch>[0]): string => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  if (input instanceof Request) return input.url
  return ''
}

const demoUsers = rightNavStoryDiscoverUsers

/** Matches `feed/page.tsx`: sidebar is `hidden` below `lg`; show it in Storybook for all viewports. */
const forceVisibleAside = String.raw`
  .storybook-rightnav aside.hidden.lg\:block {
    display: block !important;
  }
`

const meta = {
  title: 'Features/Feed/RightNav',
  component: RightNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    otherUsers: demoUsers
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = globalThis.fetch
        globalThis.fetch = async (input) => {
          const url = resolveFetchUrl(input)

          if (url.includes(rightNavStoryFetchPaths.topicsTrending)) {
            return jsonStoryResponse(buildRightNavTopicsTrendingPayload())
          }

          if (url.includes(rightNavStoryFetchPaths.posts)) {
            return jsonStoryResponse(buildRightNavPostsPayload())
          }

          if (url.includes(rightNavStoryFetchPaths.activities)) {
            return jsonStoryResponse(buildRightNavActivitiesPayload())
          }

          return jsonStoryResponse({})
        }

        return () => {
          globalThis.fetch = originalFetch
        }
      }, [])

      return (
        <div
          className={cn(
            'storybook-rightnav min-h-[760px]',
            appShellPageWashClassName
          )}
        >
          <style>{forceVisibleAside}</style>
          <Story />
        </div>
      )
    }
  ]
} satisfies Meta<typeof RightNav>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const EmptyDiscover: Story = {
  args: {
    otherUsers: []
  }
}
