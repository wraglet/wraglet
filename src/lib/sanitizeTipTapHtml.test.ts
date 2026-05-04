import { sanitizeTipTapHtml } from '@/lib/sanitizeTipTapHtml'
import { describe, expect, it } from 'vitest'

describe('sanitizeTipTapHtml', () => {
  it('strips script tags and event handlers', () => {
    const dirty =
      '<p>Hello</p><img src=x onerror=alert(1)><script>alert(1)</script>'
    const clean = sanitizeTipTapHtml(dirty)
    expect(clean).not.toMatch(/<script/i)
    expect(clean).not.toMatch(/onerror/i)
    expect(clean).toMatch(/Hello/)
  })

  it('preserves basic rich text', () => {
    const html =
      '<p><strong>Bold</strong> and <a href="https://example.com">link</a></p>'
    expect(sanitizeTipTapHtml(html)).toContain('strong')
    expect(sanitizeTipTapHtml(html)).toContain('href="https://example.com"')
  })
})
