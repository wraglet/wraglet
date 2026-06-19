import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { canUserSignIn } from '@/lib/auth/accountAccess'
import { findUserByCredential } from '@/lib/auth/resolveCredentialUser'
import client from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

const getCredentialValue = (value: unknown): string => {
  return typeof value === 'string' ? value : ''
}

const getPasswordChangedAtMs = (value: Date | undefined | null): number =>
  value instanceof Date ? value.getTime() : 0

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

          const user = await findUserByCredential(emailOrUsername)

          if (!user?.hashedPassword || !canUserSignIn(user)) {
            return null
          }

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.hashedPassword
          )

          if (isPasswordCorrect) {
            const dbUser = await User.findById(user._id).select(
              'passwordChangedAt'
            )
            return {
              _id: user._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              gender: user.gender,
              profilePicture: user.profilePicture,
              passwordChangedAt: getPasswordChangedAtMs(
                dbUser?.passwordChangedAt
              )
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
      return Boolean(auth?.user?._id)
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token._id = user._id
        token.email = user.email as string
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.gender = user.gender
        token.profilePicture = user.profilePicture
        token.passwordChangedAt =
          typeof user.passwordChangedAt === 'number'
            ? user.passwordChangedAt
            : 0
        token.invalid = false
        return token
      }

      if (!token._id || token.invalid) {
        return token
      }

      try {
        await client()
        const dbUser = await User.findById(token._id).select(
          'passwordChangedAt'
        )
        const dbMs = getPasswordChangedAtMs(dbUser?.passwordChangedAt)
        const tokenMs =
          typeof token.passwordChangedAt === 'number'
            ? token.passwordChangedAt
            : 0

        if (dbMs > tokenMs) {
          token.invalid = true
        }
      } catch (error) {
        console.error('[auth] JWT passwordChangedAt check failed:', error)
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token.invalid || !token._id) {
        return { ...session, expires: new Date(0).toISOString() }
      }

      session.user._id = token._id
      session.user.email = token.email
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.user.gender = token.gender
      session.user.profilePicture = token.profilePicture
      return session
    }
  },
  debug: process.env.AUTH_DEBUG === 'true',
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
      }
    }
  }
})
