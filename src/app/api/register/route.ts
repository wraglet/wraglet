import { NextResponse } from 'next/server'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

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
      email,
      username,
      hashedPassword,
      dob,
      gender,
      pronoun,
      friendRequests,
      publicProfileVisible
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.log('REGISTRATION ERROR: ', error)
    console.error(
      'Some error happened while accessing POST at /api/register at route.ts: ',
      error
    )
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Function to generate username
function generateUsername(firstName: string, lastName: string): string {
  const firstNameWithoutSpaces = firstName.toLowerCase().replace(/\s/g, '')
  const lastNameWithoutSpaces = lastName.toLowerCase().replace(/\s/g, '')
  const randomDigits = Math.floor(Math.random() * 90) + 10 // Generate random two-digit number
  return `@${firstNameWithoutSpaces}${lastNameWithoutSpaces}${randomDigits}`
}
