import {
  blogR2KeysRemovedSinceUpdate,
  collectBlogR2Keys,
  deleteBlogKeysFromR2,
  isSafeBlogR2Key
} from '@/lib/blogR2Cleanup'
import type { S3Client } from '@aws-sdk/client-s3'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sortKeys = (keys: string[]) => keys.toSorted((a, b) => a.localeCompare(b))

describe('isSafeBlogR2Key', () => {
  it('allows only blogs/covers and blogs/content prefixes', () => {
    expect(isSafeBlogR2Key('blogs/covers/abc')).toBe(true)
    expect(isSafeBlogR2Key('blogs/content/x')).toBe(true)
    expect(isSafeBlogR2Key('other/prefix')).toBe(false)
    expect(isSafeBlogR2Key('')).toBe(false)
    expect(isSafeBlogR2Key(null)).toBe(false)
  })

  it('trims whitespace', () => {
    expect(isSafeBlogR2Key('  blogs/covers/x  ')).toBe(true)
  })
})

describe('collectBlogR2Keys', () => {
  it('collects unique safe keys from cover and blocks', () => {
    const keys = collectBlogR2Keys({
      coverImage: { key: 'blogs/covers/c1' },
      contentBlocks: [
        { metadata: { key: 'blogs/content/i1' } },
        { metadata: { key: 'blogs/content/i1' } },
        { metadata: { key: 'evil/key' } }
      ]
    })
    expect(sortKeys(keys)).toEqual(['blogs/content/i1', 'blogs/covers/c1'])
  })

  it('ignores trimmed cover keys that are not under allowed prefixes', () => {
    expect(
      collectBlogR2Keys({
        coverImage: { key: '  other/prefix/x  ' },
        contentBlocks: []
      })
    ).toEqual([])
  })

  it('treats missing contentBlocks like an empty list', () => {
    expect(
      collectBlogR2Keys({
        coverImage: { key: 'blogs/covers/only' }
      })
    ).toEqual(['blogs/covers/only'])
  })
})

describe('blogR2KeysRemovedSinceUpdate', () => {
  it('returns keys dropped between versions', () => {
    const prev = {
      coverImage: { key: 'blogs/covers/old' },
      contentBlocks: [{ metadata: { key: 'blogs/content/a' } }]
    }
    const next = {
      coverImage: { key: 'blogs/covers/new' },
      contentBlocks: [{ metadata: { key: 'blogs/content/a' } }]
    }
    expect(sortKeys(blogR2KeysRemovedSinceUpdate(prev, next))).toEqual([
      'blogs/covers/old'
    ])
  })
})

describe('deleteBlogKeysFromR2', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('no-ops without bucket env', async () => {
    vi.stubEnv('CLOUDFLARE_R2_USERS_BUCKET_NAME', '')
    const send = vi.fn()
    const client = { send } as unknown as S3Client
    await deleteBlogKeysFromR2(client, ['blogs/covers/x'])
    expect(send).not.toHaveBeenCalled()
  })

  it('sends delete per key when bucket is set', async () => {
    vi.stubEnv('CLOUDFLARE_R2_USERS_BUCKET_NAME', 'my-bucket')
    const send = vi.fn().mockResolvedValue({})
    const client = { send } as unknown as S3Client
    await deleteBlogKeysFromR2(client, ['blogs/covers/a', 'blogs/content/b'])
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('continues after a failed delete', async () => {
    vi.stubEnv('CLOUDFLARE_R2_USERS_BUCKET_NAME', 'my-bucket')
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({})
    const client = { send } as unknown as S3Client
    await deleteBlogKeysFromR2(client, ['blogs/covers/a', 'blogs/covers/b'])
    expect(send).toHaveBeenCalledTimes(2)
    errSpy.mockRestore()
  })
})
