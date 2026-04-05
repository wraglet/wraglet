// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useIsClient } from '@/lib/hooks/useIsClient'

const Flag = () => <span data-c={useIsClient() ? '1' : '0'} />

describe('useIsClient (SSR)', () => {
  it('uses server snapshot (false) under renderToStaticMarkup', () => {
    const html = renderToStaticMarkup(<Flag />)
    expect(html).toContain('data-c="0"')
  })
})
