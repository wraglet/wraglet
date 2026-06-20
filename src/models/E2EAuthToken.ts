import { model, models, Schema } from 'mongoose'

export type AuthEmailTokenKind = 'verify' | 'reset'

export interface IE2EAuthToken {
  email: string
  kind: AuthEmailTokenKind
  token: string
  createdAt: Date
}

const E2EAuthTokenSchema = new Schema<IE2EAuthToken>(
  {
    email: { type: String, required: true },
    kind: { type: String, enum: ['verify', 'reset'], required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  { timestamps: false }
)

E2EAuthTokenSchema.index({ email: 1, kind: 1 }, { unique: true })
E2EAuthTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })

const E2EAuthToken =
  models?.E2EAuthToken ||
  model<IE2EAuthToken>('E2EAuthToken', E2EAuthTokenSchema)

export default E2EAuthToken
