import { readResponseError } from '@/lib/api/readResponseError'
import { describe, expect, it } from 'vitest'

const response = (body: string, status: number, contentType = 'text/plain') =>
  new Response(body, {
    status,
    headers: { 'Content-Type': contentType }
  })

describe('readResponseError', () => {
  it('uses a JSON error field', async () => {
    await expect(
      readResponseError(
        response(
          JSON.stringify({ error: 'Video exceeds maximum duration' }),
          400,
          'application/json'
        ),
        'Failed to start video upload'
      )
    ).resolves.toBe('Video exceeds maximum duration')
  })

  it('uses a plain-text body when the response is not JSON', async () => {
    await expect(
      readResponseError(response('Unauthorized', 401), 'Failed to upload image')
    ).resolves.toBe('Unauthorized')
  })

  it('falls back with the status when the body is empty or not a message', async () => {
    await expect(
      readResponseError(response('', 500), 'Failed to upload image')
    ).resolves.toBe('Failed to upload image (500)')
    await expect(
      readResponseError(
        response('<html>bad gateway</html>', 502),
        'Failed to finalize video upload'
      )
    ).resolves.toBe('Failed to finalize video upload (502)')
    await expect(
      readResponseError(
        response(JSON.stringify({ ok: false }), 400, 'application/json'),
        'Failed to upload part 2'
      )
    ).resolves.toBe('Failed to upload part 2 (400)')
  })
})
