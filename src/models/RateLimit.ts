import { model, models, Schema } from 'mongoose'

export interface IRateLimit {
  key: string
  count: number
  windowStartMs: number
  expiresAt: Date
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 1 },
    windowStartMs: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: false }
)

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RateLimit =
  models?.RateLimit || model<IRateLimit>('RateLimit', RateLimitSchema)

export default RateLimit
