import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string
      firstName?: string
      lastName?: string
      email: string
      profilePicture?:
        | {
            url: string
          }
        | string
    } & Omit<DefaultSession['user'], 'email'>
  }

  interface User {
    _id: string
    firstName?: string
    lastName?: string
    profilePicture?:
      | {
          url: string
        }
      | string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string
    firstName?: string
    lastName?: string
    email: string
    profilePicture?:
      | {
          url: string
        }
      | string
  }
}
