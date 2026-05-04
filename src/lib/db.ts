// reference: https://github.com/kunalagra/codegamy/blob/main/utils/dbConnect.js

import { initModels } from '@/lib/models'
import mongoose from 'mongoose'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache
}

const mongooseCache: MongooseCache = globalForMongoose.__mongooseCache ?? {
  conn: null,
  promise: null
}

globalForMongoose.__mongooseCache = mongooseCache

// Read URI when connecting, not at module load — CLI tools (e.g. seed-e2e-user) load
// `.env` / `.env.local` after imports, so a top-level read would stay undefined.
const client = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (mongooseCache.conn && mongoose.connection.readyState === 1) {
    initModels()
    return mongoose.connection
  }

  // Allow reconnect after disconnect; preserve in-flight promise while connecting.
  if (mongoose.connection.readyState === 0) {
    mongooseCache.promise = null
    mongooseCache.conn = null
  }

  try {
    // Reuse in-flight connect to prevent concurrent reconnect storms.
    mongooseCache.promise ??= mongoose.connect(uri, {
      bufferCommands: false,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    })

    mongooseCache.conn = await mongooseCache.promise

    const models = initModels()
    console.log('Models initialized:', models)

    return mongoose.connection
  } catch (error) {
    mongooseCache.promise = null
    mongooseCache.conn = null
    console.error('Error connecting to MongoDB with Mongoose:', error)
    throw error
  }
}

export default client
