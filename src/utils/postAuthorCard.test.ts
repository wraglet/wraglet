import type { IPost } from '@/models/Post'
import {
  getAuthorDisplayName,
  getAuthorProfileHref,
  getIsPostAuthor,
  getPostAuthorId
} from '@/utils/postAuthorCard'
import { describe, expect, it } from 'vitest'

const authorObject = {
  _id: 'a1',
  firstName: 'Jordan',
  lastName: 'Kim',
  username: '@demo_creator',
  gender: 'Male' as const,
  pronoun: 'He/Him' as const,
  profilePicture: null
}

describe('postAuthorCard', () => {
  it('getPostAuthorId resolves string or object id', () => {
    expect(getPostAuthorId('raw-id')).toBe('raw-id')
    expect(getPostAuthorId(authorObject as IPost['author'])).toBe('a1')
    expect(getPostAuthorId(undefined as unknown as IPost['author'])).toBe(null)
  })

  it('getIsPostAuthor compares ids as strings', () => {
    expect(getIsPostAuthor('a1', 'a1')).toBe(true)
    expect(getIsPostAuthor('a1', 'a2')).toBe(false)
    expect(getIsPostAuthor(undefined, 'a1')).toBe(false)
  })

  it('getAuthorProfileHref uses profileHrefFromUsername', () => {
    expect(getAuthorProfileHref(authorObject as IPost['author'])).toBe(
      '/@demo_creator'
    )
  })

  it('getAuthorDisplayName joins names', () => {
    expect(getAuthorDisplayName(authorObject as IPost['author'])).toBe(
      'Jordan Kim'
    )
  })
})
