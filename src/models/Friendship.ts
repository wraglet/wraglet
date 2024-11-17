import mongoose, { Document, Schema } from 'mongoose'

export interface FriendshipDocument extends Document {
  userId: mongoose.Types.ObjectId
  status: string
  following: boolean
  followed: boolean
}

const FriendshipSchema = new Schema<FriendshipDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String,
    following: Boolean,
    followed: Boolean
  },
  { timestamps: true }
)

export default mongoose.models.Friendship ||
  mongoose.model<FriendshipDocument>('Friendship', FriendshipSchema)
