import {
  containsBlockedLinks,
  extractUrls,
  isBlockedUrl
} from '@/lib/moderation/linkModeration'
import { describe, expect, it } from 'vitest'

describe('linkModeration', () => {
  it('extracts URLs from text', () => {
    expect(extractUrls('Check https://example.com/path today')).toEqual([
      'https://example.com/path'
    ])
    expect(extractUrls('Visit www.example.org for info')).toEqual([
      'www.example.org'
    ])
  })

  it('rejects dangerous schemes', () => {
    expect(isBlockedUrl('javascript:alert(1)')).toBe(true)
    expect(isBlockedUrl('data:text/html,hello')).toBe(true)
  })

  it('blocks known adult domains', () => {
    expect(containsBlockedLinks('visit https://pornhub.com/video')).toBe(true)
    expect(containsBlockedLinks('see https://onlyfans.com/user')).toBe(true)
  })

  it('blocks adult TLDs', () => {
    expect(isBlockedUrl('https://example.xxx/page')).toBe(true)
    expect(isBlockedUrl('https://site.porn/video')).toBe(true)
  })

  it('blocks IP-literal URLs', () => {
    expect(isBlockedUrl('http://192.168.1.1/path')).toBe(true)
  })

  it('allows safe domains', () => {
    expect(
      containsBlockedLinks('Read https://github.com/wraglet/wraglet')
    ).toBe(false)
    expect(containsBlockedLinks('News at https://bbc.co.uk')).toBe(false)
  })
})
