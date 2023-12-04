export interface PostInterface {
  id: string;
  content: string;
  image: null | string;
  createdAt: Date;
  updatedAt?: Date;
  authorId: string;
  audience: string;
  author: AuthorInterface;
  comments: CommentInterface[];
  likes: LikeInterface[];
}

export interface CommentInterface {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postId: string;
}

export interface UserInterface {
  username: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: Date;
  gender: string;
  bio: string | null;
  pronoun: string;
  profilePicture: string | null;
  coverPhoto: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorInterface {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dob: Date;
  gender: string;
  pronoun: string;
  profilePicture: string | null;
  coverPhoto: string | null;
  createdAt: Date;
}

export interface LikeInterface {
  id: string;
  userId: string;
  postId: string;
}
