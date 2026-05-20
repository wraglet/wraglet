import { createElement } from 'react'
import type { Preview } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@/app/globals.css'

const storybookQueryClient = new QueryClient()

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        QueryClientProvider,
        { client: storybookQueryClient },
        createElement(Story)
      )
  ],
  parameters: {
    nextjs: {
      appDirectory: true
    },
    options: {
      storySort: {
        method: 'alphabetical',
        locales: 'en-US',
        order: [
          'Wraglet',
          ['Introduction'],
          'Foundations',
          'UI Components',
          'Layouts',
          'Features',
          'Compositions'
        ]
      }
    },
    layout: 'centered',
    docs: {
      description: {
        story:
          '**Layout chrome:** Use `@/lib/uiChrome` (`appShellPageWashClassName`, `appHeaderGradientClassName`, `unauthenticatedShellBackdropClassName`) in decorators so stories match app shells. The chat panel + badge stack uses `withChatFloaterColumn` from `@/lib/storybookDecorators` (mirrors `ChatFloater.tsx`). **Auth forms:** wrap `LoginForm` / `SignUp` in `UnauthenticatedLayoutClient` with `unauthenticatedShellBackdropClassName` outside it (see those stories). **Fixtures:** `src/data/storybookUsers.ts` — `STORYBOOK_USERNAME` keys are conceptual; handles use a leading `@` like production. Use `usernameToDisplayHandle` where the UI shows a handle.'
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      // Violations surface in the Storybook UI only; use 'error' in CI if you want builds to fail.
      test: 'off'
    }
  },
  tags: ['autodocs']
}

export default preview
