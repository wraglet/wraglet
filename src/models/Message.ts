import { Document, model, models, Schema, Types } from 'mongoose'

export interface IMessage {
  _id?: string
  conversation: Types.ObjectId
  sender: Types.ObjectId
  content: string
  attachments?: { url: string; key: string }[]
  createdAt?: Date
  updatedAt?: Date
}

export interface IMessageDocument
  extends Omit<
      IMessage,
      '_id' | 'conversation' | 'sender' | 'createdAt' | 'updatedAt'
    >,
    Document {
  conversation: Types.ObjectId
  sender: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [{ url: String, key: String }]
  },
  { timestamps: true }
)

const Message =
  models?.Message || model<IMessageDocument>('Message', MessageSchema)

export default Message
