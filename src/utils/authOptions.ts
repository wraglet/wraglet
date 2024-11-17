import  { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import mongoose, { Types } from 'mongoose'
import User, { UserDocument } from '@/models/User'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
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
            return {
              id: (user._id as Types.ObjectId).toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username
            }
          }
        }
        return null
      }
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/'
  }
}
