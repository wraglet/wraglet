import { Document, model, models, Schema, Types } from 'mongoose'

export interface INotification {
  _id: string
  recipient: string
  sender?: {
    _id: string
    firstName: string
    lastName: string
    username: string
    profilePicture?: {
      url: string
      key: string
    }
  }
  type:
    | 'follow'
    | 'comment'
    | 'reaction'
    | 'new_post'
    | 'share'
    | 'admin'
    | 'system'
  title: string
  message: string
  read: boolean
  data?: {
    postId?: string
    commentId?: string
    userId?: string
    [key: string]: any
  }
  createdAt?: string
  updatedAt?: string
}

export interface INotificationDocument
  extends Omit<INotification, '_id' | 'recipient' | 'sender'>,
    Document {
  _id: Types.ObjectId
  recipient: Types.ObjectId
  sender?: Types.ObjectId
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for admin/system notifications
    type: {
      type: String,
      enum: [
        'follow',
        'comment',
        'reaction',
        'new_post',
        'share',
        'admin',
        'system'
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    data: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
)

// Index for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 })
NotificationSchema.index({ recipient: 1, read: 1 })

const Notification =
  models?.Notification ||
  model<INotificationDocument>('Notification', NotificationSchema)
export default Notification
