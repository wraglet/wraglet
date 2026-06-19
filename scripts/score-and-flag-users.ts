/**
 * One-time backfill: compute registrationRiskScore for existing users.
 * Run locally with production URI only after backup. Does not auto-delete.
 *
 * Usage: TRUST_BACKFILL_ENABLED=true tsx ./scripts/score-and-flag-users.ts
 */

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import client from '@/lib/db'
import { computeRegistrationRisk } from '@/lib/trust/computeRegistrationRisk'
import User from '@/models/User'
import { config as loadEnv } from 'dotenv'
import mongoose from 'mongoose'

loadEnv({ path: path.join(process.cwd(), '.env') })
loadEnv({ path: path.join(process.cwd(), '.env.local'), override: true })

const SUSPEND_THRESHOLD = 70

async function main() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  ) {
    console.error('[score-users] Refusing to run with production NODE_ENV.')
    process.exit(1)
  }

  if (process.env.TRUST_BACKFILL_ENABLED !== 'true') {
    console.error(
      '[score-users] Set TRUST_BACKFILL_ENABLED=true to allow writes.'
    )
    process.exit(1)
  }

  await client()
  const users = await User.find({}).lean()

  let suspended = 0
  const csvRows = ['userId,email,score,accountStatus,action']
  for (const user of users) {
    const score = computeRegistrationRisk({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt
    })

    const updates: Record<string, unknown> = { registrationRiskScore: score }
    let action = 'score_only'
    if (
      score >= SUSPEND_THRESHOLD &&
      user.accountStatus !== 'suspended' &&
      user.accountStatus !== 'deleted'
    ) {
      updates.accountStatus = 'suspended'
      suspended += 1
      action = 'suspended'
    }

    csvRows.push(
      `${user._id},${user.email},${score},${user.accountStatus ?? ''},${action}`
    )

    await User.updateOne({ _id: user._id }, { $set: updates })
  }

  const csvPath = path.join(process.cwd(), 'registration-risk-review.csv')
  writeFileSync(csvPath, csvRows.join('\n'), 'utf8')

  console.log(
    `[score-users] Scored ${users.length} users; suspended ${suspended} at score >= ${SUSPEND_THRESHOLD}.`
  )
  console.log(`[score-users] Review CSV: ${csvPath}`)
}

void main()
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[score-users] Failed:', err)
    process.exit(1)
  })
