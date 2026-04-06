import { createR2S3Client } from '@/lib/r2S3Client'
import { afterEach, describe, expect, it, vi } from 'vitest'

const s3Config = vi.hoisted(() => ({
  last: null as Record<string, unknown> | null
}))

vi.mock('@aws-sdk/client-s3', () => {
  const S3Client = vi.fn(function (this: object, cfg: Record<string, unknown>) {
    s3Config.last = cfg
  })
  return { S3Client }
})

describe('createR2S3Client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    s3Config.last = null
  })

  it('configures endpoint, region, and credentials from env', () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    vi.stubEnv('CLOUDFLARE_ACCESS_KEY_ID', 'keyid')
    vi.stubEnv('CLOUDFLARE_SECRET_ACCESS_KEY', 'sekret')
    createR2S3Client()
    expect(s3Config.last).toEqual({
      endpoint: 'https://acc123.r2.cloudflarestorage.com',
      region: 'auto',
      credentials: {
        accessKeyId: 'keyid',
        secretAccessKey: 'sekret'
      }
    })
  })

  it('defaults missing credential env vars to empty strings', () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    vi.stubEnv('CLOUDFLARE_ACCESS_KEY_ID', '')
    vi.stubEnv('CLOUDFLARE_SECRET_ACCESS_KEY', '')
    createR2S3Client()
    expect(s3Config.last).toMatchObject({
      credentials: { accessKeyId: '', secretAccessKey: '' }
    })
  })

  it('uses ?? fallback when credential env vars are absent', () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    vi.unstubAllEnvs()
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    delete process.env.CLOUDFLARE_ACCESS_KEY_ID
    delete process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    createR2S3Client()
    expect(s3Config.last).toMatchObject({
      credentials: { accessKeyId: '', secretAccessKey: '' }
    })
  })

  it('uses defined access key with missing secret', () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    vi.stubEnv('CLOUDFLARE_ACCESS_KEY_ID', 'only-access')
    delete process.env.CLOUDFLARE_SECRET_ACCESS_KEY
    createR2S3Client()
    expect(s3Config.last).toMatchObject({
      credentials: { accessKeyId: 'only-access', secretAccessKey: '' }
    })
  })

  it('uses defined secret with missing access key', () => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc123')
    delete process.env.CLOUDFLARE_ACCESS_KEY_ID
    vi.stubEnv('CLOUDFLARE_SECRET_ACCESS_KEY', 'only-secret')
    createR2S3Client()
    expect(s3Config.last).toMatchObject({
      credentials: { accessKeyId: '', secretAccessKey: 'only-secret' }
    })
  })
})
