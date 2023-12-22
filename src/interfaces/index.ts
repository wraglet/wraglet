export interface PostInterface {
  _id: string;
  content: {
    text?: string;
    images?: Array<{
      url: string;
      key: string;
    }>;
  };
  audience: string;
  createdAt: Date;
  updatedAt?: Date;
  author: AuthorInterface;
  comments?: CommentInterface[];
  reactions?: ReactionInterface[];
  upvotes: number;
  downvotes: number;
  votes: PostVoteInterface[];
}

export interface CommentInterface {
  _id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  authorId: string | undefined;
  postId: string;
  reactions?: ReactionInterface[];
}

export interface ReactionInterface {
  _id: string;
  type: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserInterface {
  _id: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  email: string;
  hashedPassword: string;
  username: string;
  dob: Date;
  gender: string;
  bio?: string | null;
  pronoun: string;
  profilePicture?: {
    url: string;
    key: string;
  } | null;
  coverPhoto?: {
    url: string;
    key: string;
  } | null;
  createdAt: Date;
  updatedAt?: Date;
  publicProfileVisible: boolean;
  friendRequests?: string | null;
  friends: string[];
}

export interface AuthorInterface {
  firstName: string;
  lastName: string;
  username: string;
  gender: string;
  pronoun: string;
  profilePicture?: {
    url: string;
    key: string;
  } | null;
  coverPhoto?: {
    url: string;
    key: string;
  } | null;
}

export interface PostVoteInterface {
  _id: string;
  postId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
  updatedAt?: Date;
}
