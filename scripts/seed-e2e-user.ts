/**
 * Upserts a deterministic user for Playwright E2E / local CI testing only.
 *
 * Safety: refuses production (`NODE_ENV` / `VERCEL_ENV`) and requires explicit
 * `E2E_SEED_ENABLED=true`. Next.js deploys never run this; Playwright global setup sets
 * the flag when seeding before tests.
 *
 * Requires MONGODB_URI, E2E_TEST_USER_PASSWORD, and E2E_SEED_ENABLED (unless invoked from
 * Playwright with that env injected). Email must end with `@wraglet.local` unless
 * `E2E_SEED_ALLOW_ANY_EMAIL=true`. Password must meet sign-up rules (see .env.example).
 * Also upserts a stable post and published blog (see e2e/fixtures/seed-constants.ts).
 */

import path from 'node:path'
import client from '@/lib/db'
import Blog from '@/models/Blog'
import Post from '@/models/Post'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { config as loadEnv } from 'dotenv'
import mongoose, { Types } from 'mongoose'

import {
  E2E_SEED_BLOG_SLUG,
  E2E_SEED_BLOG_TITLE,
  E2E_SEED_POST_ID
} from '../e2e/fixtures/seed-constants'

loadEnv({ path: path.join(process.cwd(), '.env') })
loadEnv({ path: path.join(process.cwd(), '.env.local'), override: true })

const DEFAULT_EMAIL = 'e2e-test@wraglet.local'
const DEFAULT_USERNAME = '@e2e_wraglet'

async function seedE2eContent(userId: Types.ObjectId) {
  await Post.findOneAndUpdate(
    { _id: new Types.ObjectId(E2E_SEED_POST_ID) },
    {
      $set: {
        content: { text: 'E2E seeded post for functional tests.' },
        audience: 'public',
        author: userId,
        reactions: [],
        votes: [],
        comments: [],
        shareCount: 0
      }
    },
    { upsert: true }
  )
  console.log(`[seed:e2e] Upserted post /post/${E2E_SEED_POST_ID}`)

  const existingBlog = await Blog.findOne({ slug: E2E_SEED_BLOG_SLUG })
  if (existingBlog && String(existingBlog.author) !== String(userId)) {
    throw new Error(
      `[seed:e2e] Blog slug "${E2E_SEED_BLOG_SLUG}" belongs to another user. Remove it or change the slug in e2e/fixtures/seed-constants.ts.`
    )
  }

  const textBlock = {
    id: 'e2e-seed-block-1',
    type: 'text' as const,
    content:
      'This blog was created by yarn seed:e2e for automated testing. It is safe to delete after tests.',
    order: 0
  }

  if (existingBlog) {
    existingBlog.title = E2E_SEED_BLOG_TITLE
    existingBlog.summary = 'Summary for E2E functional tests.'
    existingBlog.contentBlocks = [textBlock]
    existingBlog.category = 'Technology'
    existingBlog.tags = ['e2e']
    existingBlog.status = 'published'
    existingBlog.author = userId
    if (!existingBlog.publishedAt) {
      existingBlog.publishedAt = new Date()
    }
    await existingBlog.save()
  } else {
    const blog = new Blog({
      title: E2E_SEED_BLOG_TITLE,
      summary: 'Summary for E2E functional tests.',
      contentBlocks: [textBlock],
      category: 'Technology',
      tags: ['e2e'],
      status: 'published',
      author: userId,
      slug: E2E_SEED_BLOG_SLUG,
      publishedAt: new Date()
    })
    await blog.save()
  }
  console.log(`[seed:e2e] Upserted blog /blog/${E2E_SEED_BLOG_SLUG}`)
}

async function main() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  ) {
    console.error(
      '[seed:e2e] Refusing to run in production. This script must never target a production database.'
    )
    process.exit(1)
  }

  const seedFlag = process.env.E2E_SEED_ENABLED
  if (seedFlag !== 'true' && seedFlag !== '1') {
    console.error(
      '[seed:e2e] Set E2E_SEED_ENABLED=true (or 1) to allow database writes. Playwright global setup sets this automatically; for manual runs add it to .env.local.'
    )
    process.exit(1)
  }

  const password = process.env.E2E_TEST_USER_PASSWORD
  if (!password) {
    console.error(
      '[seed:e2e] Missing E2E_TEST_USER_PASSWORD. Set it in .env or .env.local (see .env.example).'
    )
    process.exit(1)
  }

  if (!process.env.MONGODB_URI) {
    console.error('[seed:e2e] Missing MONGODB_URI.')
    process.exit(1)
  }

  const email = (process.env.E2E_TEST_USER_EMAIL ?? DEFAULT_EMAIL).toLowerCase()
  const allowAnyEmail =
    process.env.E2E_SEED_ALLOW_ANY_EMAIL === 'true' ||
    process.env.E2E_SEED_ALLOW_ANY_EMAIL === '1'
  if (!allowAnyEmail && !email.endsWith('@wraglet.local')) {
    console.error(
      '[seed:e2e] E2E_TEST_USER_EMAIL must end with @wraglet.local (reserved for local/CI test accounts). Set E2E_SEED_ALLOW_ANY_EMAIL=true only if you intentionally use another address in an isolated database.'
    )
    process.exit(1)
  }

  const usernameRaw = process.env.E2E_TEST_USER_USERNAME ?? DEFAULT_USERNAME
  const username = usernameRaw.startsWith('@') ? usernameRaw : `@${usernameRaw}`

  try {
    await client()
    const hashedPassword = await bcrypt.hash(password, 12)

    const existingByEmail = await User.findOne({ email })
    if (existingByEmail) {
      existingByEmail.hashedPassword = hashedPassword
      existingByEmail.accountStatus = 'active'
      existingByEmail.emailVerifiedAt =
        existingByEmail.emailVerifiedAt ?? new Date()
      existingByEmail.canonicalEmail = existingByEmail.canonicalEmail ?? email
      await existingByEmail.save()
      console.log(`[seed:e2e] Updated password for existing user: ${email}`)
    } else {
      const usernameTaken = await User.findOne({ username })
      if (usernameTaken) {
        throw new Error(
          `[seed:e2e] Username ${username} is already taken by another account. Set E2E_TEST_USER_USERNAME to a unique handle.`
        )
      }

      await User.create({
        firstName: 'E2E',
        lastName: 'Test',
        email,
        canonicalEmail: email,
        username,
        hashedPassword,
        dob: new Date('1990-01-15T00:00:00.000Z'),
        gender: 'Others',
        pronoun: 'They/Them',
        publicProfileVisible: true,
        accountStatus: 'active',
        emailVerifiedAt: new Date()
      })
      console.log(`[seed:e2e] Created user: ${email} (${username})`)
    }

    const userDoc = await User.findOne({ email }).orFail()
    await seedE2eContent(userDoc._id as Types.ObjectId)
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

void main()
  .then(() => {
    // Mongoose/driver may leave handles (timers, sockets) after disconnect(); without
    // an explicit exit, the CLI would hang and Playwright globalSetup would block on execSync.
    process.exit(0)
  })
  .catch((err) => {
    console.error('[seed:e2e] Failed:', err)
    process.exit(1)
  })
