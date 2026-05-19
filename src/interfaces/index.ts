// Gender type for consistency across the application
export type Gender = 'Female' | 'Male' | 'Others' | 'Prefer not to say'

// Pronoun type for consistency across the application
export type Pronoun = 'She/Her' | 'He/Him' | 'They/Them' | 'Prefer not to say'

/**
 * Legacy UI-oriented post shape in this file.
 *
 * @deprecated Prefer {@link IPost} from `@/models/Post` as the domain source of truth.
 * Derive view-specific types with `Pick` / `Omit` as needed.
 */
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
  postId?: string
  blogId?: string
  userId: AuthorInterface
  createdAt: Date
  updatedAt: Date
}

/**
 * Full user record including `hashedPassword` — appropriate for server-only code paths.
 *
 * @deprecated For database documents use {@link IUser} / {@link IUserDocument} from `@/models/User`.
 * For client-safe session/API user data use {@link PublicUser}.
 */
export interface UserInterface {
  _id: string
  firstName: string
  lastName: string
  suffix?: string
  email: string
  hashedPassword: string
  username: string
  dob: Date
  gender: Gender
  bio?: string | null
  pronoun: Pronoun
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
  gender: Gender
  pronoun: Pronoun
  bio?: string | null
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

export interface SearchResultItem {
  _id: string
  type: 'user' | 'post' | 'blog' | 'video'
  title: string
  subtitle?: string
  avatar?: string
  gender: Gender
  url: string
  relevanceScore?: number
}

export interface SearchResponse {
  success: boolean
  results: SearchResultItem[]
  totalCount: number
  query: string
}

export interface SearchSuggestion {
  _id: string
  text: string
  type: 'user' | 'post' | 'blog' | 'video' | 'recent'
  avatar?: string
  url: string
}

/** Fields returned by getCurrentUser, getOtherUsers, and similar server actions (no password). */
export interface PublicUser {
  _id: string
  firstName: string
  lastName: string
  email?: string
  username: string
  gender: Gender
  pronoun: Pronoun
  bio?: string | null
  profilePicture?: {
    url: string
    key: string
  } | null
  coverPhoto?: {
    url: string
    key: string
  } | null
  dob?: string | Date
  publicProfileVisible?: boolean
  followingIds?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

/** User card in discover / right nav (no password; optional discovery flags). */
export type DiscoverUser = PublicUser & {
  isTrending?: boolean
  isRecentActive?: boolean
  isNew?: boolean
}

export interface TrendingTopic {
  tag: string
  count: number
}

/** Body for POST /api/posts when sharing a blog to the feed. */
export interface BlogShareFeedPayload {
  text: string
  audience: 'public' | 'mutuals' | 'only_me'
  isBlogShare: true
  blogUrl: string
  blogSlug: string
  blogTitle: string
  blogSummary: string
  blogCategory: string
  blogCoverImage?: string
}
