import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import client from '@/lib/db'
import User, { type IUserDocument } from '@/models/User'
import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'

// Define a type for the user with _id field for lean() queries
type UserWithId = IUserDocument & {
  _id: Types.ObjectId
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await client()
          console.log('Connected to MongoDB')

          const user = (await User.findOne({
            email: (credentials?.email as string).toLowerCase()
          }).lean()) as UserWithId | null

          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials?.password as string,
              user.hashedPassword
            )
            console.log('Password comparison result:', isPasswordCorrect)

            if (isPasswordCorrect) {
              return {
                _id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture
              }
            }
          } else {
            console.log('User not found with email:', credentials?.email)
          }
        } catch (error) {
          console.error('Error during authorization:', error)
        }
        return null
      }
    })
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token._id = user._id
        token.email = user.email as string
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.profilePicture = user.profilePicture
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user._id = token._id
        session.user.email = token.email
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.profilePicture = token.profilePicture
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/'
  }
})
