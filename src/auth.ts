import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import client from '@/lib/db'
import User, { IUserDocument } from '@/models/User'
import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'

// Define a type for the user with _id field for lean() queries
type UserWithId = IUserDocument & {
  _id: Types.ObjectId
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id?: string
    email?: string | null
    firstName?: string
    lastName?: string
    username?: string
    emailVerified?: Date | null
  }
  interface Session {
    user: User & {
      id: string
      email: string
      firstName: string
      lastName: string
      username: string
      emailVerified: Date | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    firstName: string
    lastName: string
    username: string
  }
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
            console.log('User found:', user)
            const isPasswordCorrect = await bcrypt.compare(
              credentials?.password as string,
              user.hashedPassword
            )
            console.log('Password comparison result:', isPasswordCorrect)

            if (isPasswordCorrect) {
              return {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                emailVerified: null
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
        const typedToken = token as JWT & {
          id: string
          email: string
          firstName: string
          lastName: string
          username: string
          emailVerified: Date | null
        }
        typedToken.id = user.id || ''
        typedToken.email = user.email || ''
        typedToken.firstName = user.firstName || ''
        typedToken.lastName = user.lastName || ''
        typedToken.username = user.username || ''
        typedToken.emailVerified = user.emailVerified || null
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        const typedToken = token as JWT & {
          id: string
          email: string
          firstName: string
          lastName: string
          username: string
          emailVerified: Date | null
        }
        session.user = {
          id: typedToken.id,
          email: typedToken.email,
          firstName: typedToken.firstName,
          lastName: typedToken.lastName,
          username: typedToken.username,
          emailVerified: typedToken.emailVerified
        }
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
