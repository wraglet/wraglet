import {
  getClientMountSnapshot,
  getServerMountSnapshot,
  subscribeToClientMount
} from '@/lib/hooks/clientMountSync'
import { describe, expect, it } from 'vitest'

describe('clientMountSync', () => {
  it('subscribe returns an unsubscribe noop', () => {
    const teardown = subscribeToClientMount()
    expect(typeof teardown).toBe('function')
    expect(teardown()).toBeUndefined()
  })

  it('exposes client vs server snapshots', () => {
    expect(getClientMountSnapshot()).toBe(true)
    expect(getServerMountSnapshot()).toBe(false)
  })
})
