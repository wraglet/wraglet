import { describe, expect, it } from 'vitest'

import { requestMatchesFixtureQuery } from './mswAdapter'

describe('requestMatchesFixtureQuery', () => {
  it('matches when fixture has no query', () => {
    expect(
      requestMatchesFixtureQuery('http://localhost/api/posts', {
        route: '/api/posts',
        method: 'GET',
        status: 200,
        responseBody: {}
      })
    ).toBe(true)
  })

  it('matches when all fixture params exist on request', () => {
    expect(
      requestMatchesFixtureQuery('http://localhost/api/search?q=ada&extra=1', {
        route: '/api/search',
        method: 'GET',
        status: 200,
        query: 'q=ada',
        responseBody: {}
      })
    ).toBe(true)
  })

  it('fails when a fixture param value differs', () => {
    expect(
      requestMatchesFixtureQuery('http://localhost/api/search?q=bob', {
        route: '/api/search',
        method: 'GET',
        status: 200,
        query: 'q=ada',
        responseBody: {}
      })
    ).toBe(false)
  })
})
