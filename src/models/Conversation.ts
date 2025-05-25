import { Document, model, models, Schema, Types } from 'mongoose'

export interface IConversation {
  _id?: string
  participants: Types.ObjectId[]
  isGroup: boolean
  name?: string
  lastMessage?: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
  lastRead?: { user: Types.ObjectId; at: Date }[]
}

export interface IConversationDocument
  extends Omit<
      IConversation,
      '_id' | 'participants' | 'lastMessage' | 'createdAt' | 'updatedAt'
    >,
    Document {
  participants: Types.ObjectId[]
  lastMessage?: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
  lastRead?: { user: Types.ObjectId; at: Date }[]
}

const LastReadSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
)

const ConversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    isGroup: { type: Boolean, default: false },
    name: { type: String },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastRead: [LastReadSchema]
  },
  { timestamps: true }
)

const Conversation =
  models?.Conversation ||
  model<IConversationDocument>('Conversation', ConversationSchema)

export default Conversation
