export interface PostInterface {
  _id: string
  content: {
    text?: string
    images?: Array<{
      url: string
      key: string
    }>
  }
  audience: string
  author: AuthorInterface
  reactions: {
    userId: {
      _id: string
    }
    type: string
  }[]
  votes: PostVoteInterface[]
  comments?: {
    _id: string
    content: string
    author: AuthorInterface
    post: string
    createdAt?: string
    updatedAt?: string
  }[]
  createdAt: string | Date
  updatedAt?: string | Date
  __v?: number // Mongoose version key
}

export interface PostReactionInterface {
  _id: string
  type: string
  postId: string
  userId: AuthorInterface
  createdAt: Date
  updatedAt: Date
}

export interface UserInterface {
  _id: string
  firstName: string
  lastName: string
  suffix?: string
  email: string
  hashedPassword: string
  username: string
  dob: Date
  gender: string
  bio?: string | null
  pronoun: string
  profilePicture?: {
    url: string
    key: string
  } | null
  coverPhoto?: {
    url: string
    key: string
  } | null
  createdAt: Date
  updatedAt?: Date
  publicProfileVisible: boolean
  followingIds: string[]
}

export interface AuthorInterface {
  _id: string
  firstName: string
  lastName: string
  username: string
  gender: string
  pronoun: string
  profilePicture?: {
    url: string
    key: string
  } | null
  coverPhoto?: {
    url: string
    key: string
  } | null
}

export interface PostVoteInterface {
  userId: string
  voteType: 'upvote' | 'downvote'
  createdAt: Date
  updatedAt?: Date
}
