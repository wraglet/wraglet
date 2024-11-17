// reference: https://github.com/kunalagra/codegamy/blob/main/utils/dbConnect.js
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!

// Create a function to connect to the database
const client = async () => {
  if (mongoose.connection.readyState >= 1) {
    // If already connected, return the existing connection
    return mongoose.connection
  }

  try {
    // Connect to the MongoDB database using Mongoose
    await mongoose.connect(uri)
    console.log('Connected to MongoDB with Mongoose')
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error)
    throw error
  }
}

export default client
