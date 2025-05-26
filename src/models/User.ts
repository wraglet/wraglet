import { Document, model, models, Schema } from 'mongoose'

// Base User interface without MongoDB document properties
export interface IUser {
  firstName: string
  lastName: string
  suffix?: string
  email: string
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
  photoCollection: Array<{
    url: string
    key: string
    type: 'post' | 'avatar'
    createdAt: Date
  }>
  createdAt?: Date
  updatedAt?: Date
}

// Interface for User document with authentication needs
export interface IUserDocument extends IUser, Document {
  hashedPassword: string
}

// Schema includes all fields including hashedPassword
const UserSchema = new Schema<IUserDocument>(
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
    photoCollection: [
      {
        url: String,
        key: String,
        type: {
          type: String,
          enum: ['post', 'avatar'],
          required: true
        },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
)

const User = models?.User || model<IUserDocument>('User', UserSchema)

export default User
