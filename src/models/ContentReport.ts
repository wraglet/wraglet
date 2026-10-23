import { Document, model, models, Schema, Types } from 'mongoose'

export type ContentReportTargetType = 'post' | 'comment' | 'user' | 'message'

export type ContentReportStatus = 'open' | 'dismissed' | 'resolved'

export type ContentReportReason =
  | 'spam'
  | 'harassment'
  | 'explicit'
  | 'misinformation'
  | 'other'

export interface IContentReport {
  _id: string
  reporter: string
  targetType: ContentReportTargetType
  targetId: string
  reason: ContentReportReason
  details?: string
  status: ContentReportStatus
  createdAt?: string
  updatedAt?: string
}

export interface IContentReportDocument
  extends Omit<
      IContentReport,
      '_id' | 'reporter' | 'targetId' | 'createdAt' | 'updatedAt'
    >,
    Document {
  _id: Types.ObjectId
  reporter: Types.ObjectId
  targetId: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const ContentReportSchema = new Schema<IContentReportDocument>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'user', 'message'],
      required: true
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'explicit', 'misinformation', 'other'],
      required: true
    },
    details: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ['open', 'dismissed', 'resolved'],
      default: 'open'
    }
  },
  { timestamps: true }
)

ContentReportSchema.index({ status: 1, createdAt: -1 })
ContentReportSchema.index({ reporter: 1, createdAt: -1 })
ContentReportSchema.index({ targetType: 1, targetId: 1 })

const ContentReport =
  models?.ContentReport ||
  model<IContentReportDocument>('ContentReport', ContentReportSchema)

export default ContentReport
