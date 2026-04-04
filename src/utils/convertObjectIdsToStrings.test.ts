import mongoose from 'mongoose'
import { describe, expect, it } from 'vitest'

import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

describe('convertObjectIdsToStrings', () => {
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
})
