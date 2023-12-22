import {
  AuthorInterface,
  CommentInterface,
  PostVoteInterface,
  ReactionInterface
} from '@/interfaces';
import mongoose, { Document, Schema } from 'mongoose';

export interface PostDocument extends Document {
  _id: string;
  content: {
    text?: string;
    images?: [
      {
        url: string;
        key: string;
      }
    ];
  };
  audience: string;
  author: AuthorInterface;
  comments: CommentInterface[]; // Change this to use Types.ObjectId
  reactions: ReactionInterface[]; // Change this to use Types.ObjectId
  upvotes: number;
  downvotes: number;
  votes: PostVoteInterface[]; // Array of PostVote references
  createdAt: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<PostDocument>(
  {
    content: {
      text: String,
      images: [{ type: Object, url: String, key: String }]
    },
    audience: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reaction' }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostVote' }] // Array of PostVote references
  },
  { timestamps: true }
);

export default (mongoose.models.Post as mongoose.Model<PostDocument>) ||
  mongoose.model<PostDocument>('Post', PostSchema);
