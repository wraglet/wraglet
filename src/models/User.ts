import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  email: string;
  hashedPassword: string;
  username: string;
  dob: Date;
  gender: string;
  bio?: string;
  pronoun: string;
  profilePicture?: {
    url: string;
    key: string;
  };
  coverPhoto?: {
    url: string;
    key: string;
  };
  publicProfileVisible: boolean;
  friendRequests: string;
  friends: string[];
  createdAt: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    firstName: String,
    lastName: String,
    suffix: String,
    email: { type: String, unique: true },
    hashedPassword: String,
    username: String,
    dob: Date,
    gender: String,
    bio: String,
    pronoun: String,
    profilePicture: { type: Object, url: String, key: String },
    coverPhoto: { type: Object, url: String, key: String },
    publicProfileVisible: { type: Boolean, default: true },
    friendRequests: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Friendship' }]
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<UserDocument>('User', UserSchema);
