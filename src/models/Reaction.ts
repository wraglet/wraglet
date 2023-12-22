import mongoose, { Document, Schema } from 'mongoose';

enum ReactionType {
  Like = 'like',
  Love = 'love'
  // Add other reaction types as needed
}

export interface ReactionDocument extends Document {
  type: ReactionType;
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  commentId: mongoose.Types.ObjectId;
}

const ReactionSchema = new Schema<ReactionDocument>(
  {
    type: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
  },
  { timestamps: true }
);

export default mongoose.models.Reaction ||
  mongoose.model<ReactionDocument>('Reaction', ReactionSchema);
