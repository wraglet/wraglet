import {
  detectImageType,
  parseDataUrlImage,
  processImageBuffer
} from '@/lib/media/uploadToR2'
import { describe, expect, it } from 'vitest'

const tinyPng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('uploadToR2 validation', () => {
  it('parses a data URL image', () => {
    const parsed = parseDataUrlImage(tinyPng)
    expect(parsed.mime).toBe('image/png')
    expect(parsed.buffer.length).toBeGreaterThan(0)
    expect(detectImageType(parsed.buffer)).toBe('png')
  })

  it('rejects non-image data URLs', () => {
    expect(() => parseDataUrlImage('data:text/plain,hello')).toThrow(
      'Invalid image format'
    )
  })

  it('strips metadata and keeps png output for png input', async () => {
    const { buffer } = parseDataUrlImage(tinyPng)
    const processed = await processImageBuffer(buffer)
    expect(processed.contentType).toBe('image/png')
    expect(processed.extension).toBe('png')
    expect(processed.buffer.length).toBeGreaterThan(0)
  })
})
