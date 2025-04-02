'use client'

import { configureAbly } from '@ably-labs/react-hooks'

const client = configureAbly({
  authUrl: '/api/token',
  clientId: Math.random().toString(36).substring(2, 15),
  authMethod: 'GET'
})

export function AblyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
