// reference: https://github.com/kunalagra/codegamy/blob/main/utils/dbConnect.js

import { ensureBlogLikedByRenamedToReactedBy } from '@/lib/migrateBlogLikesToReactions'
import { initModels } from '@/lib/models'
import mongoose from 'mongoose'

// Read URI when connecting, not at module load — CLI tools (e.g. seed-e2e-user) load
// `.env` / `.env.local` after imports, so a top-level read would stay undefined.
const client = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (mongoose.connection.readyState >= 1) {
    initModels()
    await ensureBlogLikedByRenamedToReactedBy()
    return mongoose.connection
  }

  try {
    // Connect to the MongoDB database using Mongoose
    await mongoose.connect(uri)
    console.log('Connected to MongoDB with Mongoose')

    const models = initModels()
    console.log('Models initialized:', models)

    await ensureBlogLikedByRenamedToReactedBy()
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error)
    throw error
  }
}

export default client
