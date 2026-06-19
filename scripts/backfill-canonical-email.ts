/**
 * Backfill canonicalEmail for existing users (Gmail dot-alias dedupe).
 * Run against a backup copy first. Does not change accountStatus.
 *
 * Usage: TRUST_BACKFILL_ENABLED=true tsx ./scripts/backfill-canonical-email.ts
 */

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import client from '@/lib/db'
import { canonicalizeEmail } from '@/lib/trust/validateEmail'
import User from '@/models/User'
import { config as loadEnv } from 'dotenv'
import mongoose from 'mongoose'

loadEnv({ path: path.join(process.cwd(), '.env') })
loadEnv({ path: path.join(process.cwd(), '.env.local'), override: true })

async function main() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  ) {
    console.error(
      '[backfill-canonical] Refusing to run with production NODE_ENV.'
    )
    process.exit(1)
  }

  if (process.env.TRUST_BACKFILL_ENABLED !== 'true') {
    console.error(
      '[backfill-canonical] Set TRUST_BACKFILL_ENABLED=true to allow writes.'
    )
    process.exit(1)
  }

  await client()
  const users = await User.find({}).lean()
  const conflicts: string[] = []
  let updated = 0

  for (const user of users) {
    const canonical = canonicalizeEmail(user.email)
    const existing = await User.findOne({
      canonicalEmail: canonical,
      _id: { $ne: user._id }
    }).lean<{ email: string; _id: unknown } | null>()

    if (existing) {
      conflicts.push(
        `${user.email} -> ${canonical} conflicts with ${existing.email} (${existing._id})`
      )
      continue
    }

    if (user.canonicalEmail !== canonical) {
      await User.updateOne(
        { _id: user._id },
        { $set: { canonicalEmail: canonical } }
      )
      updated += 1
    }
  }

  if (conflicts.length > 0) {
    const reportPath = path.join(process.cwd(), 'canonical-email-conflicts.txt')
    writeFileSync(reportPath, conflicts.join('\n'), 'utf8')
    console.warn(
      `[backfill-canonical] ${conflicts.length} conflicts written to ${reportPath}`
    )
  }

  console.log(
    `[backfill-canonical] Processed ${users.length} users; updated ${updated}.`
  )
}

void main()
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[backfill-canonical] Failed:', err)
    process.exit(1)
  })
