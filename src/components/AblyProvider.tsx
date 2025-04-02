'use client'

import { configureAbly } from '@ably-labs/react-hooks'

const ably = configureAbly({
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY!,
  clientId: Math.random().toString(36).substring(2, 15),
  recover: function (_, cb) {
    cb(true)
  }
})

export default function AblyProvider({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
