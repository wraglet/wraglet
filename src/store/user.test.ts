import useUserStore, { type User } from '@/store/user'
import { afterEach, describe, expect, it } from 'vitest'

const sampleUser = (): User => ({
  _id: 'u1',
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  username: '@ab',
  gender: 'Others',
  createdAt: '',
  updatedAt: '',
  photoCollection: []
})

describe('useUserStore', () => {
  afterEach(() => {
    useUserStore.setState({ user: null })
  })

  it('sets and clears user', () => {
    const s = useUserStore.getState()
    s.setUser(sampleUser())
    expect(useUserStore.getState().user?._id).toBe('u1')
    s.clearUser()
    expect(useUserStore.getState().user).toBeNull()
  })

  it('updatePhotoCollection preserves user shell', () => {
    useUserStore.getState().setUser(sampleUser())
    useUserStore.getState().updatePhotoCollection([
      {
        url: 'https://x.test/p.png',
        key: 'k',
        type: 'post',
        createdAt: 't'
      }
    ])
    const u = useUserStore.getState().user
    expect(u?.photoCollection).toHaveLength(1)
    expect(u?.firstName).toBe('A')
  })

  it('updatePhotoCollection is a no-op without user', () => {
    useUserStore.getState().clearUser()
    useUserStore.getState().updatePhotoCollection([])
    expect(useUserStore.getState().user).toBeNull()
  })
})
