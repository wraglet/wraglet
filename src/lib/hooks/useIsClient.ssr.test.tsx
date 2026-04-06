// @vitest-environment node

import { useIsClient } from '@/lib/hooks/useIsClient'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

const Flag = () => <span data-c={useIsClient() ? '1' : '0'} />

describe('useIsClient (SSR)', () => {
  it('uses server snapshot (false) under renderToStaticMarkup', () => {
    const html = renderToStaticMarkup(<Flag />)
    expect(html).toContain('data-c="0"')
  })
})
