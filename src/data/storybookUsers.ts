/**
 * Storybook-only user fixtures. Mirrors MongoDB: `username` includes a leading `@`.
 *
 * **Naming:** exports and `STORYBOOK_USERNAME` keys are conceptual (PRIMARY, FEMALE_PRIMARY,
 * NONBINARY_PEER, …). Display names in objects stay fictional for realistic UI; they are not
 * reflected in the TypeScript identifiers.
 */

import type { AuthorInterface, PublicUser, UserInterface } from '@/interfaces'
import type { IBlog } from '@/models/Blog'
import type { User } from '@/store/user'

export const STORYBOOK_USERNAME = {
  /** Default “signed-in” demo account — not tied to a real person. */
  PRIMARY: '@demo_creator',
  /** Primary female persona for discover / lists / chat mocks. */
  FEMALE_PRIMARY: '@mika_builds',
  /** Non-binary persona (they/them) for diversity in mocks. */
  NONBINARY_PEER: '@ari_stone',
  /** Male persona for “another member” scenarios. */
  MALE_PEER: '@noah_notes',
  /** Second male persona when two distinct male peers are needed. */
  MALE_PEER_ALT: '@lee_santos',
  /** Distinct session for “another logged-in user” in stories. */
  VIEWER: '@story_viewer'
} as const

/** Placeholder avatar for the primary Storybook demo user. */
export const STORYBOOK_AVATAR_URI_PRIMARY =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%25' height='100%25' fill='%2342BBFF'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='white'>D</text></svg>"

/** Placeholder avatar for `NONBINARY_PEER` fixtures. */
export const STORYBOOK_AVATAR_URI_NONBINARY_PEER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='white'>A</text></svg>"

/** Placeholder avatar for `FEMALE_PRIMARY` fixtures. */
export const STORYBOOK_AVATAR_URI_FEMALE_PRIMARY =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%25' height='100%25' fill='%2342BBFF'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='white'>M</text></svg>"

/** Placeholder cover for blog stories (matches gradient style used in Blog detail/edit demos). */
export const STORYBOOK_BLOG_COVER_GRADIENT =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='%237C3AED'/><stop offset='1' stop-color='%230EA5E9'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23g)'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='54' fill='white'>Blog</text></svg>"

/** Large placeholder for profile upload / crop stories */
export const STORYBOOK_AVATAR_UPLOAD_PREVIEW =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><rect width='100%25' height='100%25' fill='%230EA5E9'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='120' fill='white'>W</text></svg>"

const STORYBOOK_DOB = new Date('1990-01-15T00:00:00.000Z')
const STORYBOOK_CREATED = new Date('2026-01-01')
const STORYBOOK_UPDATED = new Date('2026-01-02')

export type StorybookDiscoverUser = UserInterface & {
  isTrending?: boolean
  isRecentActive?: boolean
  isNew?: boolean
}

const storybookEmailFromUsername = (username: string) =>
  `${username.replace(/^@/, '')}@storybook.wraglet`

const baseUserInterface = (
  _id: string,
  firstName: string,
  lastName: string,
  username: string,
  gender: UserInterface['gender'],
  pronoun: UserInterface['pronoun'],
  overrides?: Partial<UserInterface>
): UserInterface => ({
  _id,
  firstName,
  lastName,
  email: storybookEmailFromUsername(username),
  hashedPassword: '',
  username,
  dob: STORYBOOK_DOB,
  gender,
  pronoun,
  profilePicture: null,
  publicProfileVisible: true,
  followingIds: [],
  createdAt: STORYBOOK_CREATED,
  updatedAt: STORYBOOK_UPDATED,
  ...overrides
})

export const storybookDiscoverUserNonbinaryPeer: StorybookDiscoverUser = {
  ...baseUserInterface(
    'user-ari',
    'Ari',
    'Stone',
    STORYBOOK_USERNAME.NONBINARY_PEER,
    'Others',
    'They/Them'
  ),
  isTrending: true
}

export const storybookDiscoverUserFemalePrimary: StorybookDiscoverUser = {
  ...baseUserInterface(
    'user-mika',
    'Mika',
    'Chen',
    STORYBOOK_USERNAME.FEMALE_PRIMARY,
    'Female',
    'She/Her',
    {
      profilePicture: {
        url: STORYBOOK_AVATAR_URI_FEMALE_PRIMARY,
        key: 'story-m'
      }
    }
  ),
  isNew: true
}

/** Mobile discover drawer: trending + new (flags differ from RightNav female-primary row). */
export const storybookDiscoverUserFemalePrimaryTrending: StorybookDiscoverUser =
  {
    ...baseUserInterface(
      'user-mika',
      'Mika',
      'Chen',
      STORYBOOK_USERNAME.FEMALE_PRIMARY,
      'Female',
      'She/Her',
      {
        profilePicture: {
          url: STORYBOOK_AVATAR_URI_FEMALE_PRIMARY,
          key: 'mika-avatar'
        },
        createdAt: new Date('2026-01-02'),
        updatedAt: STORYBOOK_UPDATED
      }
    ),
    isTrending: true
  }

export const storybookDiscoverUserMalePeer: StorybookDiscoverUser = {
  ...baseUserInterface(
    'user-noah',
    'Noah',
    'Park',
    STORYBOOK_USERNAME.MALE_PEER,
    'Male',
    'He/Him',
    {
      createdAt: new Date('2026-01-03'),
      updatedAt: STORYBOOK_UPDATED
    }
  ),
  isNew: true
}

export const storybookDiscoverPeopleShort: StorybookDiscoverUser[] = [
  storybookDiscoverUserNonbinaryPeer,
  storybookDiscoverUserFemalePrimary
]

export const storybookDiscoverDrawerUsers: StorybookDiscoverUser[] = [
  storybookDiscoverUserFemalePrimaryTrending,
  storybookDiscoverUserMalePeer
]

export const storybookPublicUserPrimary: PublicUser = {
  _id: 'user-primary',
  firstName: 'Jordan',
  lastName: 'Kim',
  username: STORYBOOK_USERNAME.PRIMARY,
  gender: 'Male',
  pronoun: 'He/Him',
  profilePicture: null
}

export const storybookPublicUserNonbinaryPeer: PublicUser = {
  _id: 'user-ari',
  firstName: 'Ari',
  lastName: 'Stone',
  username: STORYBOOK_USERNAME.NONBINARY_PEER,
  gender: 'Others',
  pronoun: 'They/Them',
  profilePicture: null
}

export const storybookAuthorPrimary: AuthorInterface = {
  _id: 'user-primary',
  firstName: 'Jordan',
  lastName: 'Kim',
  username: STORYBOOK_USERNAME.PRIMARY,
  gender: 'Male',
  pronoun: 'He/Him',
  profilePicture: null
}

/** Published blog sample with cover and tags — `BlogDetail` / `FeedBlogCard` stories; matches app `IBlog` shape. */
export const storybookIBlogPublishedSample: IBlog = {
  _id: 'blog-1',
  title: 'Building a Feed-Owned Blog Experience',
  slug: 'feed-owned-blog-experience',
  summary:
    'Why Wraglet treats blog creation, reading, and editing as part of the feed experience.',
  category: 'Design',
  tags: ['feed', 'blogs', 'storybook'],
  status: 'published',
  coverImage: {
    url: STORYBOOK_BLOG_COVER_GRADIENT,
    key: 'cover'
  },
  author: storybookAuthorPrimary,
  contentBlocks: [
    {
      id: 'block-1',
      type: 'text',
      content:
        '<p>Blogs are long-form feed content created from the feed, then read from a canonical detail route just like posts.</p>',
      order: 0
    },
    {
      id: 'block-2',
      type: 'code',
      content: 'href="/blog/feed-owned-blog-experience"',
      order: 1,
      metadata: {
        language: 'tsx'
      }
    }
  ],
  reactions: [],
  comments: [],
  likes: 12,
  views: 240,
  readTime: 4,
  createdAt: new Date('2026-01-01').toISOString(),
  publishedAt: new Date('2026-01-02').toISOString()
}

/** Feed card variant: no cover, no tags — still exercises category pill and metadata row. */
export const storybookIBlogFeedCompact: IBlog = {
  ...storybookIBlogPublishedSample,
  _id: 'blog-feed-compact',
  slug: 'compact-feed-blog',
  title: 'A compact feed blog card',
  summary:
    'No cover image and no tags. The feed still shows read time, views, category, and reactions.',
  tags: [],
  coverImage: undefined,
  likes: 5,
  views: 89,
  readTime: 2
}

export const storybookZustandUserPrimary = (
  overrides?: Partial<User>
): User => ({
  _id: 'user-primary',
  firstName: 'Jordan',
  lastName: 'Kim',
  email: 'demo-creator@storybook.wraglet',
  username: STORYBOOK_USERNAME.PRIMARY,
  gender: 'Male',
  pronoun: 'He/Him',
  profilePicture: { url: STORYBOOK_AVATAR_URI_PRIMARY },
  createdAt: STORYBOOK_CREATED.toISOString(),
  updatedAt: STORYBOOK_UPDATED.toISOString(),
  photoCollection: [],
  publicProfileVisible: true,
  followingIds: [],
  ...overrides
})

export const storybookZustandUserViewer = (
  overrides?: Partial<User>
): User => ({
  _id: 'viewer-1',
  firstName: 'Story',
  lastName: 'Viewer',
  email: 'viewer@example.com',
  username: STORYBOOK_USERNAME.VIEWER,
  gender: 'Female',
  pronoun: 'She/Her',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  photoCollection: [],
  ...overrides
})

export const storybookAuthorNonbinaryPeer: AuthorInterface = {
  _id: 'u1',
  firstName: 'Ari',
  lastName: 'Stone',
  username: STORYBOOK_USERNAME.NONBINARY_PEER,
  gender: 'Others',
  pronoun: 'They/Them',
  profilePicture: {
    url: STORYBOOK_AVATAR_URI_NONBINARY_PEER,
    key: 'demo-key'
  }
}

export const storybookGroupChatParticipants = [
  {
    _id: 'user-ari',
    firstName: 'Ari',
    lastName: 'Stone',
    username: STORYBOOK_USERNAME.NONBINARY_PEER,
    gender: 'Others',
    profilePicture: STORYBOOK_AVATAR_URI_NONBINARY_PEER
  },
  {
    _id: 'user-mika',
    firstName: 'Mika',
    lastName: 'Chen',
    username: STORYBOOK_USERNAME.FEMALE_PRIMARY,
    gender: 'Female',
    profilePicture: undefined
  },
  {
    _id: 'user-noah',
    firstName: 'Noah',
    lastName: 'Park',
    username: STORYBOOK_USERNAME.MALE_PEER,
    gender: 'Male',
    profilePicture: undefined
  },
  {
    _id: 'user-lee',
    firstName: 'Lee',
    lastName: 'Santos',
    username: STORYBOOK_USERNAME.MALE_PEER_ALT,
    gender: 'Male',
    profilePicture: undefined
  }
] as const

export const storybookNewChatModalUsers = [
  {
    _id: 'user-ari',
    firstName: 'Ari',
    lastName: 'Stone',
    username: STORYBOOK_USERNAME.NONBINARY_PEER,
    gender: 'Others',
    profilePicture: {
      url: STORYBOOK_AVATAR_URI_NONBINARY_PEER
    }
  },
  {
    _id: 'user-mika',
    firstName: 'Mika',
    lastName: 'Chen',
    username: STORYBOOK_USERNAME.FEMALE_PRIMARY,
    gender: 'Female',
    profilePicture: null
  }
] as const

const storybookChatParticipantCurrent = {
  _id: 'user-current',
  firstName: 'Jordan',
  lastName: 'Kim',
  username: STORYBOOK_USERNAME.PRIMARY
}

const storybookChatParticipantNonbinaryPeer = {
  _id: 'user-ari',
  firstName: 'Ari',
  lastName: 'Stone',
  username: STORYBOOK_USERNAME.NONBINARY_PEER,
  profilePicture: undefined
}

const storybookChatParticipantFemalePrimary = {
  _id: 'user-mika',
  firstName: 'Mika',
  lastName: 'Chen',
  username: STORYBOOK_USERNAME.FEMALE_PRIMARY
}

const storybookChatParticipantMalePeer = {
  _id: 'user-noah',
  firstName: 'Noah',
  lastName: 'Park',
  username: STORYBOOK_USERNAME.MALE_PEER
}

export const storybookChatFloaterDemoConversations = [
  {
    _id: 'conversation-1',
    isGroup: false,
    participants: [
      storybookChatParticipantCurrent,
      storybookChatParticipantNonbinaryPeer
    ],
    unreadCount: 2,
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'conversation-2',
    isGroup: true,
    name: 'Design Circle',
    participants: [
      storybookChatParticipantCurrent,
      storybookChatParticipantFemalePrimary,
      storybookChatParticipantMalePeer
    ],
    unreadCount: 106,
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
]
