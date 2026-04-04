import type { IPost } from '@/models/Post'
import { describe, expect, it } from 'vitest'

import {
  isPopulatedPostAuthor,
  mergePostClientUpdate,
  mergePostFromFeedProp
} from '@/utils/mergePostClientUpdate'

const author: IPost['author'] = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada',
  gender: 'Female',
  pronoun: 'She/Her'
}

const basePost: IPost = {
  _id: 'post-1',
  content: { text: 'hello' },
  audience: 'public',
  author,
  reactions: [],
  votes: [],
  comments: []
}

describe('isPopulatedPostAuthor', () => {
  it('returns true for a populated user shape', () => {
    expect(isPopulatedPostAuthor(author)).toBe(true)
  })

  it('returns false for null, id-only, or primitives', () => {
    expect(isPopulatedPostAuthor(null)).toBe(false)
    expect(isPopulatedPostAuthor('507f1f77bcf86cd799439011')).toBe(false)
    expect(isPopulatedPostAuthor({ _id: 'x' })).toBe(false)
  })
})

describe('mergePostClientUpdate', () => {
  it('merges shallow fields from the patch', () => {
    const next = mergePostClientUpdate(basePost, { shareCount: 3 })
    expect(next.shareCount).toBe(3)
    expect(next.content.text).toBe('hello')
  })

  it('keeps populated author when patch replaces author with an unpopulated value', () => {
    const next = mergePostClientUpdate(basePost, {
      author: '507f1f77bcf86cd799439011' as unknown as IPost['author']
    })
    expect(next.author).toEqual(author)
  })

  it('keeps populated author when patch sets author to null', () => {
    const next = mergePostClientUpdate(basePost, {
      author: null as unknown as IPost['author']
    })
    expect(next.author).toEqual(author)
  })

  it('preserves author when patch repeats the same id string', () => {
    const next = mergePostClientUpdate(basePost, {
      author: author._id as unknown as IPost['author']
    })
    expect(next.author).toEqual(author)
  })
})

describe('mergePostFromFeedProp', () => {
  it('prefers populated author from incoming when present', () => {
    const incomingAuthor: IPost['author'] = {
      ...author,
      firstName: 'Updated'
    }
    const incoming: IPost = {
      ...basePost,
      author: '507f1f77bcf86cd799439011' as unknown as IPost['author']
    }
    const fixed: IPost = { ...incoming, author: incomingAuthor }
    const next = mergePostFromFeedProp(basePost, fixed)
    expect(next.author).toEqual(incomingAuthor)
  })

  it('keeps previous populated author when incoming only has an id', () => {
    const incoming: IPost = {
      ...basePost,
      author: '507f1f77bcf86cd799439011' as unknown as IPost['author'],
      shareCount: 9
    }
    const next = mergePostFromFeedProp(basePost, incoming)
    expect(next.author).toEqual(author)
    expect(next.shareCount).toBe(9)
  })

  it('uses incoming id-only author when neither side is populated', () => {
    const prev: IPost = {
      ...basePost,
      author: 'a1' as unknown as IPost['author']
    }
    const incoming: IPost = {
      ...basePost,
      author: 'b2' as unknown as IPost['author'],
      shareCount: 3
    }
    const next = mergePostFromFeedProp(prev, incoming)
    expect(next.author).toBe('b2')
    expect(next.shareCount).toBe(3)
  })
})
