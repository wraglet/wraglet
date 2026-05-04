import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import * as Ably from 'ably'

export const GET = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ablyApiKey = process.env.ABLY_API_KEY?.trim()
    if (!ablyApiKey) {
      return NextResponse.json(
        {
          errorMessage: 'Missing ABLY_API_KEY environment variable.'
        },
        { status: 500 }
      )
    }

    const client = new Ably.Rest(ablyApiKey)
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: currentUser._id.toString()
    })

    return NextResponse.json(tokenRequestData)
  } catch (error: unknown) {
    console.error('Error in token endpoint:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
