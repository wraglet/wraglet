import mongoose, { Document, Schema } from 'mongoose';

export interface CommentDocument extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  reactions: string[];
}

const CommentSchema = new Schema<CommentDocument>(
  {
    content: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }]
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model<CommentDocument>('Comment', CommentSchema);
