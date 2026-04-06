import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'
import mongoose from 'mongoose'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('convertObjectIdsToStrings', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('converts top-level ObjectId to string', () => {
    const id = new mongoose.Types.ObjectId()
    expect(convertObjectIdsToStrings(id)).toBe(id.toString())
  })

  it('converts nested ObjectIds and dates in plain objects', () => {
    const id = new mongoose.Types.ObjectId()
    const createdAt = new Date('2024-01-15T12:00:00.000Z')
    const input = {
      _id: id,
      name: 'x',
      createdAt
    }
    expect(convertObjectIdsToStrings(input)).toEqual({
      _id: id.toString(),
      name: 'x',
      createdAt: createdAt.toISOString()
    })
  })

  it('returns the same converted author object for duplicate in-memory references', () => {
    const authorId = new mongoose.Types.ObjectId()
    const author = {
      _id: authorId,
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada',
      gender: 'Female' as const,
      pronoun: 'She/Her' as const
    }
    const posts = [
      { _id: new mongoose.Types.ObjectId(), author },
      { _id: new mongoose.Types.ObjectId(), author }
    ]
    const out = convertObjectIdsToStrings(posts) as typeof posts
    expect(out[0].author).toBe(out[1].author)
    expect(out[0].author._id).toBe(authorId.toString())
    expect(out[0].author.firstName).toBe('Ada')
  })

  it('omits Buffer values', () => {
    const input = { bin: Buffer.from('ab') }
    expect(convertObjectIdsToStrings(input)).toEqual({})
  })

  it('leaves non-plain objects (e.g. class instances) unchanged at the root', () => {
    class Box {
      value = 1
    }
    const box = new Box()
    expect(convertObjectIdsToStrings(box)).toBe(box)
  })

  it('omits a property when conversion throws (e.g. broken Date)', () => {
    vi.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
      throw new Error('bad date')
    })
    const id = new mongoose.Types.ObjectId()
    expect(
      convertObjectIdsToStrings({
        createdAt: new Date('2020-01-01'),
        _id: id
      })
    ).toEqual({ _id: id.toString() })
  })

  it('still treats null-prototype dicts as plain objects', () => {
    const raw = Object.assign(Object.create(null), {
      _id: new mongoose.Types.ObjectId()
    })
    expect(convertObjectIdsToStrings(raw)).toEqual({
      _id: (raw as { _id: mongoose.Types.ObjectId })._id.toString()
    })
  })

  it('passes through null, undefined, and primitives at the root', () => {
    expect(convertObjectIdsToStrings(null)).toBeNull()
    expect(convertObjectIdsToStrings(undefined)).toBeUndefined()
    expect(convertObjectIdsToStrings(0)).toBe(0)
    expect(convertObjectIdsToStrings('plain')).toBe('plain')
  })

  it('converts a top-level Date and omits a top-level Buffer', () => {
    const d = new Date('2024-06-01T00:00:00.000Z')
    expect(convertObjectIdsToStrings(d)).toBe(d.toISOString())
    expect(convertObjectIdsToStrings(Buffer.from('x'))).toBeUndefined()
  })

  it('filters array items that convert to undefined (e.g. Buffer)', () => {
    expect(convertObjectIdsToStrings([Buffer.from('a'), 'keep'])).toEqual([
      'keep'
    ])
  })

  it('does not push array elements whose conversion is undefined', () => {
    expect(convertObjectIdsToStrings([undefined, 1])).toEqual([1])
  })

  it('returns memoized output when the same object reference appears twice', () => {
    const id = new mongoose.Types.ObjectId()
    const inner = { _id: id, n: 1 }
    const out = convertObjectIdsToStrings([inner, inner]) as unknown[]
    expect(out[0]).toBe(out[1])
    expect((out[0] as { _id: string })._id).toBe(id.toString())
  })

  it('reuses memo for circular plain objects', () => {
    const id = new mongoose.Types.ObjectId()
    const root: Record<string, unknown> = { _id: id }
    root.self = root
    const out = convertObjectIdsToStrings(root) as Record<string, unknown>
    expect(out._id).toBe(id.toString())
    expect(out.self).toBe(out)
  })

  it('omits nested keys when ObjectId.toString throws', () => {
    const bad = new mongoose.Types.ObjectId()
    vi.spyOn(bad, 'toString').mockImplementation(() => {
      throw new Error('bad id')
    })
    const ok = new mongoose.Types.ObjectId()
    expect(
      convertObjectIdsToStrings({
        bad,
        good: ok
      })
    ).toEqual({ good: ok.toString() })
  })

  it('keeps non-plain nested values (e.g. URL) as-is', () => {
    const u = new URL('https://example.com/path')
    expect(convertObjectIdsToStrings({ u })).toEqual({ u })
  })

  it('does not set object keys when the nested value is undefined', () => {
    expect(convertObjectIdsToStrings({ keep: 1, drop: undefined })).toEqual({
      keep: 1
    })
  })
})
