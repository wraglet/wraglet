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

const getCredentialValue = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const emailOrUsername = getCredentialValue(credentials?.email)
            .trim()
            .toLowerCase()
          const password = getCredentialValue(credentials?.password)

          if (!emailOrUsername || !password) {
            return null
          }

          await client()

          // Check if the input is an email (contains @ but not at the start, and has a domain)
          const isEmail =
            emailOrUsername.includes('@') &&
            !emailOrUsername.startsWith('@') &&
            emailOrUsername.includes('.')

          // Create query to search by either email or username
          let searchQuery
          if (isEmail) {
            searchQuery = { email: emailOrUsername }
          } else {
            // For usernames, if it doesn't start with @, add it
            // If it already starts with @, keep it as is
            const username = emailOrUsername.startsWith('@')
              ? emailOrUsername
              : `@${emailOrUsername}`
            searchQuery = { username: username }
          }

          const user = (await User.findOne(
            searchQuery
          ).lean()) as UserWithId | null

          if (user?.hashedPassword) {
            const isPasswordCorrect = await bcrypt.compare(
              password,
              user.hashedPassword
            )

            if (isPasswordCorrect) {
              return {
                _id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender,
                profilePicture: user.profilePicture
              }
            }
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
        token.gender = user.gender
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
        session.user.gender = token.gender
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
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
        // Optionally set domain for production if needed:
        // domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
      }
    }
  }
})
