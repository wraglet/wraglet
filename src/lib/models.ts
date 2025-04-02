// This file ensures all models are registered before use in the app

// Import all models to ensure they're registered

import Comment from '@/models/Comment'
import Post from '@/models/Post'
import PostReaction from '@/models/PostReaction'
import User from '@/models/User'
import mongoose from 'mongoose'

// Export all models for convenience
export { Comment, Post, PostReaction, User }

// Export a function to initialize models
export const initModels = () => {
  // Return the registered models for verification
  return {
    Comment: mongoose.models.Comment ? true : false,
    Post: mongoose.models.Post ? true : false,
    User: mongoose.models.User ? true : false,
    PostReaction: mongoose.models.PostReaction ? true : false
  }
}

export default initModels
