import { STORYBOOK_USERNAME } from '@/data/storybookUsers'

/** Default discover users for RightNav stories (re-export for a single import site). */
export { storybookDiscoverPeopleShort as rightNavStoryDiscoverUsers } from '@/data/storybookUsers'

/** Path substrings matched by `RightNav` Storybook fetch decorator (keep aligned with `RightNav` fetches). */
export const rightNavStoryFetchPaths = {
  topicsTrending: '/api/users/topics-trending',
  posts: '/api/posts',
  activities: '/api/activities'
} as const

export const jsonStoryResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

export const buildRightNavTopicsTrendingPayload = () => ({
  topics: [
    { tag: 'storybook', count: 24 },
    { tag: 'design-system', count: 18 }
  ]
})

export const buildRightNavPostsPayload = () => ({
  posts: [
    {
      _id: 'post-1',
      content: {
        text: 'A quick update from the design system feed.'
      },
      images: [],
      author: {
        firstName: 'Ari',
        lastName: 'Stone',
        username: STORYBOOK_USERNAME.NONBINARY_PEER
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'post-2',
      content: {
        text: 'Second trending post — compact list spacing in Storybook.'
      },
      images: [],
      author: {
        firstName: 'Mika',
        lastName: 'Chen',
        username: STORYBOOK_USERNAME.FEMALE_PRIMARY
      },
      createdAt: new Date().toISOString()
    }
  ]
})

export const buildRightNavActivitiesPayload = () => ({
  success: true,
  activities: [
    {
      _id: 'act-1',
      user: {
        firstName: 'Mika',
        lastName: 'Chen',
        username: STORYBOOK_USERNAME.FEMALE_PRIMARY,
        gender: 'Female',
        profilePicture: null
      },
      action: 'started following Ari Stone',
      timestamp: new Date().toISOString()
    }
  ]
})
