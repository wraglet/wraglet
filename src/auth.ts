import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import client from '@/lib/db'
import User, { IUserDocument } from '@/models/User'
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

          // Use explicit typing for the Mongoose lean result
          const user = (await User.findOne({
            email: (credentials?.email as string).toLowerCase()
          }).lean()) as UserWithId | null

          if (user) {
            console.log('User found:', user)
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password as string,
              user.hashedPassword
            )
            console.log('Password comparison result:', isPasswordCorrect)

            if (isPasswordCorrect) {
              return {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username
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
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    }
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt'
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/'
  }
})
