import { useEffect } from 'react'
import { appShellPageWashClassName } from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  STORYBOOK_USERNAME,
  storybookDiscoverPeopleShort
} from '@/data/storybookUsers'
import RightNav from '@/components/feed/RightNav'

const resolveFetchUrl = (input: Parameters<typeof fetch>[0]): string => {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  if (input instanceof Request) return input.url
  return ''
}

const demoUsers = storybookDiscoverPeopleShort

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

          if (url.includes('/api/users/topics-trending')) {
            return new Response(
              JSON.stringify({
                topics: [
                  { tag: 'storybook', count: 24 },
                  { tag: 'design-system', count: 18 }
                ]
              }),
              { status: 200 }
            )
          }

          if (url.includes('/api/posts')) {
            return new Response(
              JSON.stringify({
                posts: [
                  {
                    _id: 'post-1',
                    content: {
                      text: 'A quick update from the design system feed.'
                    },
                    images: [],
                    author: {
                      firstName: 'Ari',
                      lastName: 'Stone',
                      username: STORYBOOK_USERNAME.NONBINARY_PEER
                    },
                    createdAt: new Date().toISOString()
                  },
                  {
                    _id: 'post-2',
                    content: {
                      text: 'Second trending post — compact list spacing in Storybook.'
                    },
                    images: [],
                    author: {
                      firstName: 'Mika',
                      lastName: 'Chen',
                      username: STORYBOOK_USERNAME.FEMALE_PRIMARY
                    },
                    createdAt: new Date().toISOString()
                  }
                ]
              }),
              { status: 200 }
            )
          }

          if (url.includes('/api/activities')) {
            return new Response(
              JSON.stringify({
                activities: [
                  {
                    _id: 'act-1',
                    user: {
                      firstName: 'Mika',
                      lastName: 'Chen',
                      username: STORYBOOK_USERNAME.FEMALE_PRIMARY,
                      gender: 'Female',
                      profilePicture: null
                    },
                    action: 'started following Ari Stone',
                    timestamp: new Date().toISOString()
                  }
                ]
              }),
              { status: 200 }
            )
          }

          return new Response(JSON.stringify({}), { status: 200 })
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
