import mongoose, { Document, Schema } from 'mongoose';

export interface PostVoteDocument extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  voteType: 'upvote' | 'downvote';
}

const PostVoteSchema = new Schema<PostVoteDocument>(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    voteType: { type: String, enum: ['upvote', 'downvote'] }
  },
  { timestamps: true }
);

export default mongoose.models.PostVote ||
  mongoose.model<PostVoteDocument>('PostVote', PostVoteSchema);
