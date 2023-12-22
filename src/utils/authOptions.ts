import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import dbConnect from '@/libs/dbConnect';
import User, { UserDocument } from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text'
        },
        password: {
          label: 'Password',
          type: 'text'
        }
      },
      async authorize(credentials) {
        // Check if the user exists.
        await dbConnect();

        const user: UserDocument | null = await User.findOne({
          email: credentials?.email?.toLowerCase()
        }).lean();

        if (user) {
          const isPasswordCorrect = await bcrypt.compare(
            credentials!.password,
            user.hashedPassword
          );

          if (isPasswordCorrect) {
            // Cast user to UserDocument to access properties
            const typedUser: UserDocument = user as UserDocument;

            return {
              id: typedUser._id.toString(), // convert ObjectId to string
              firstName: typedUser.firstName,
              lastName: typedUser.lastName,
              email: typedUser.email,
              dob: typedUser.dob,
              username: typedUser.username,
              gender: typedUser.gender,
              bio: typedUser.bio,
              pronoun: typedUser.pronoun,
              profilePicture: typedUser.profilePicture,
              coverPhoto: typedUser.coverPhoto
            };
          } else {
            throw new Error('Wrong Credentials!');
          }
        } else {
          throw new Error('User not found!');
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
};
