import { NextResponse } from 'next/server'
import client from '@/lib/db'
import {
  isAuthTokenCaptureEnabled,
  readCapturedAuthEmailToken
} from '@/lib/email/captureAuthEmailToken'
import type { AuthEmailTokenKind } from '@/lib/email/captureAuthEmailToken'
import { normalizeEmailInput } from '@/lib/trust/validateEmail'

const parseKind = (value: string | null): AuthEmailTokenKind | null => {
  if (value === 'verify' || value === 'reset') return value
  return null
}

export const GET = async (request: Request) => {
  if (!isAuthTokenCaptureEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const kind = parseKind(searchParams.get('kind'))

  if (!email || !kind) {
    return NextResponse.json(
      { error: 'Missing email or kind' },
      { status: 400 }
    )
  }

  await client()
  const token = await readCapturedAuthEmailToken(
    normalizeEmailInput(email),
    kind
  )

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  return NextResponse.json({ token })
}
