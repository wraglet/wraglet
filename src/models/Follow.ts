import { Document, model, models, Schema, Types } from 'mongoose'

export interface IFollowDocument extends Document {
  followerId: Types.ObjectId
  followingId: Types.ObjectId
  createdAt?: Date
}

const FollowSchema = new Schema<IFollowDocument>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

const Follow = models?.Follow || model<IFollowDocument>('Follow', FollowSchema)
export default Follow
