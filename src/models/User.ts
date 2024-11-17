'use server'

import mongoose, { Document, Schema } from 'mongoose'

export interface UserDocument extends Document {
  firstName: string
  lastName: string
  suffix?: string
  email: string
  hashedPassword: string
  username: string
  dob: Date
  gender: string
  bio?: string
  pronoun: string
  profilePicture?: {
    url: string
    key: string
  }
  coverPhoto?: {
    url: string
    key: string
  }
  publicProfileVisible: boolean
  friendRequests: string
  followers: [
    {
      userId: string
      createdAt: Date
    }
  ]
  following: [
    {
      userId: string

      createdAt: Date
    }
  ]
  friends: [
    {
      userId: string
      relationship: string
      createdAt: Date
    }
  ]
}

const UserSchema = new Schema<UserDocument>(
  {
    firstName: String,
    lastName: String,
    suffix: String,
    email: { type: String, unique: true },
    hashedPassword: String,
    username: String,
    dob: Date,
    gender: String,
    bio: String,
    pronoun: String,
    profilePicture: { type: Object, url: String, key: String },
    coverPhoto: { type: Object, url: String, key: String },
    publicProfileVisible: { type: Boolean, default: true },
    friendRequests: String,
    followers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    following: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    friends: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        relationship: String
      }
    ]
  },
  { timestamps: true }
)

const User =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema)

export default User
