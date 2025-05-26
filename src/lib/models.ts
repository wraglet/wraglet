// This file ensures all models are registered before use in the app

// Import all models to ensure they're registered

import Comment from '@/models/Comment'
import Conversation from '@/models/Conversation'
import Follow from '@/models/Follow'
import Message from '@/models/Message'
import Post from '@/models/Post'
import PostReaction from '@/models/PostReaction'
import PostVote from '@/models/PostVote'
import User from '@/models/User'
import mongoose from 'mongoose'

// Export all models for convenience
export {
  Comment,
  Conversation,
  Follow,
  Message,
  Post,
  PostReaction,
  PostVote,
  User
}

// Export a function to initialize models
export const initModels = () => {
  // Return the registered models for verification
  return {
    Comment: !!mongoose.models.Comment,
    Post: !!mongoose.models.Post,
    PostReaction: !!mongoose.models.PostReaction,
    PostVote: !!mongoose.models.PostVote,
    User: !!mongoose.models.User,
    Message: !!mongoose.models.Message,
    Conversation: !!mongoose.models.Conversation,
    Follow: !!mongoose.models.Follow
  }
}

export default initModels
