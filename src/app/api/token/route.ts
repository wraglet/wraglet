import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import * as Ably from 'ably'

export const GET = async () => {
  try {
    const currentUser = await getCurrentUser()
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json(
        {
          errorMessage: 'Missing ABLY_API_KEY environment variable.'
        },
        { status: 500 }
      )
    }

    const client = new Ably.Rest(process.env.ABLY_API_KEY)
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: currentUser?._id?.toString() || 'anonymous'
    })

    return NextResponse.json(tokenRequestData)
  } catch (error: any) {
    console.error('Error in token endpoint:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
