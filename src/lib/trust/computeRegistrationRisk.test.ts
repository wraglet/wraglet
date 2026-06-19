import { describe, expect, it } from 'vitest'

import { computeRegistrationRisk } from './computeRegistrationRisk'

describe('computeRegistrationRisk', () => {
  it('scores bot-like signup patterns highly', () => {
    const score = computeRegistrationRisk({
      firstName: 'sWuHgCBpPKoBNEfZ',
      lastName: 'xK9mN2pQvR',
      email: 'u.l.u.p.u.y.e.y@gmail.com',
      accountStatus: 'pending_verification',
      createdAt: new Date()
    })
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('scores normal verified users lower', () => {
    const score = computeRegistrationRisk({
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@example.com',
      emailVerifiedAt: new Date(),
      accountStatus: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      postCount: 3,
      followCount: 2
    })
    expect(score).toBeLessThan(40)
  })
})
