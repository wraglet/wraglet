import { NextResponse } from 'next/server'
import client from '@/lib/db'
import { generateUsername } from '@/lib/utils'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const POST = async (request: Request) => {
  try {
    await client()

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      gender,
      pronoun,
      friendRequests,
      publicProfileVisible
    } = body

    if (
      !email ||
      !firstName ||
      !lastName ||
      !dob ||
      !gender ||
      !pronoun ||
      !friendRequests ||
      !publicProfileVisible ||
      !password
    ) {
      return new NextResponse('Missing info', { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const username = generateUsername(firstName, lastName)

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username,
      hashedPassword,
      dob,
      gender,
      pronoun,
      friendRequests,
      publicProfileVisible
    })

    console.log('User created successfully!')

    return NextResponse.json(user)
  } catch (error: any) {
    console.log('REGISTRATION ERROR: ', error)
    // Log detailed error information
    console.error(
      'Some error happened while accessing POST at /api/register at route.ts: ',
      error
    )
    return new NextResponse('Internal Error', { status: 500 })
  }
}
