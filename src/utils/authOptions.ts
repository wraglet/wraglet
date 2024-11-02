import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import User, { UserDocument } from '@/models/User'
import bcrypt from 'bcryptjs'
import mongoose, { Types } from 'mongoose'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Check if the user exists.
        await mongoose.connect(process.env.MONGODB_URI!)

        const user = (await User.findOne({
          email: credentials?.email?.toLowerCase()
        }).lean()) as UserDocument | null

        if (user) {
          const isPasswordCorrect = await bcrypt.compare(
            credentials!.password,
            user.hashedPassword
          )

          if (isPasswordCorrect) {
            // Return only the necessary fields for the User type
            return {
              id: (user._id as Types.ObjectId).toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username
            }
          } else {
            throw new Error('Wrong Credentials!')
          }
        } else {
          throw new Error('User not found!')
        }
      }
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/'
  }
}
