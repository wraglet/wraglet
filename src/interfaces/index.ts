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
  reactions?: PostReactionInterface[]
  upvotes: number
  downvotes: number
  votes: PostVoteInterface[]
  createdAt: Date
  updatedAt?: Date
}

export interface PostReactionInterface {
  _id: string // Assuming _id is also a string
  type: string
  postId: string // Adjust the type to string if it's supposed to be a string
  userId: AuthorInterface // Adjust the type to string if it's supposed to be a string
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
  friendRequests?: string | null
  friends: string[]
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
