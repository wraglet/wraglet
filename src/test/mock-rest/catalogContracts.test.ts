import { activitiesSuccessSchema } from '@/contracts/activities'
import { adminNotificationsPostSuccessSchema } from '@/contracts/admin'
import {
  blogCommentSchema,
  blogCoreSchema,
  blogCreateSuccessSchema,
  blogsListSuccessSchema,
  blogUploadImageSuccessSchema
} from '@/contracts/blogs'
import { conversationsListSuccessSchema } from '@/contracts/conversations'
import {
  followsFollowingIdsSchema,
  followsMutationSchema,
  followsProfileCountsSchema
} from '@/contracts/follows'
import {
  updateCoverSuccessSchema,
  updatePhotoCollectionUserSchema,
  updateProfileSuccessSchema
} from '@/contracts/media'
import {
  messagesListSuccessSchema,
  messagesMutationSuccessSchema
} from '@/contracts/messages'
import {
  notificationsListSchema,
  notificationsPatchSuccessSchema
} from '@/contracts/notifications'
import {
  postCommentSchema,
  postDetailSchema,
  postMutationSuccessSchema
} from '@/contracts/postsApi'
import {
  postsCreateSuccessSchema,
  postsFeedSuccessSchema,
  postsFeedUnauthorizedSchema
} from '@/contracts/postsFeed'
import { registerSuccessSchema } from '@/contracts/register'
import { searchResponseSchema } from '@/contracts/search'
import { apiErrorBodySchema } from '@/contracts/shared'
import {
  shareCommentSuccessSchema,
  shareCreateSuccessSchema,
  shareDocumentSchema,
  sharesListSuccessSchema
} from '@/contracts/shares'
import {
  tokenServerErrorSchema,
  tokenSuccessSchema,
  tokenUnauthorizedSchema
} from '@/contracts/token'
import { topicsTrendingSuccessSchema } from '@/contracts/topicsTrending'
import {
  usersDiscoverSuccessSchema,
  usersListSuccessSchema,
  usersPasswordPatchSuccessSchema,
  usersPeopleYouMayKnowSuccessSchema,
  usersSuggestedSuccessSchema,
  usersTrendingSuccessSchema,
  usersUnauthorizedSchema
} from '@/contracts/usersApi'
import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

import { MOCK_REST_CATALOG } from './catalog'

type FixtureKey = `${string} ${string} ${number}`

const schemaFor = (
  route: string,
  method: string,
  status: number,
  query?: string
): z.ZodTypeAny | undefined => {
  if (route === '/api/follows' && method === 'GET' && status === 200 && query) {
    return followsProfileCountsSchema
  }
  if (route === '/api/follows' && method === 'GET' && status === 200) {
    return undefined
  }

  const key: FixtureKey = `${method} ${route} ${status}`

  const map: Partial<Record<FixtureKey, z.ZodTypeAny>> = {
    'GET /api/activities 200': activitiesSuccessSchema,
    'GET /api/activities 401': apiErrorBodySchema,
    'POST /api/admin/notifications 200': adminNotificationsPostSuccessSchema,
    'POST /api/admin/notifications 400': apiErrorBodySchema,
    'GET /api/blogs 200': blogsListSuccessSchema,
    'POST /api/blogs 201': blogCreateSuccessSchema,
    'GET /api/blogs/:slug 200': blogCoreSchema,
    'GET /api/blogs/:slug 404': apiErrorBodySchema,
    'PATCH /api/blogs/:slug/react 200': blogCoreSchema,
    'POST /api/blogs/:slug/comment 200': blogCommentSchema,
    'POST /api/blogs/upload-image 200': blogUploadImageSuccessSchema,
    'GET /api/conversations 200': conversationsListSuccessSchema,
    'GET /api/conversations 401': apiErrorBodySchema,
    'POST /api/follows 200': followsMutationSchema,
    'GET /api/messages 200': messagesListSuccessSchema,
    'POST /api/messages 200': messagesMutationSuccessSchema,
    'GET /api/messages 401': apiErrorBodySchema,
    'GET /api/notifications 200': notificationsListSchema,
    'PATCH /api/notifications 200': notificationsPatchSuccessSchema,
    'GET /api/posts 200': postsFeedSuccessSchema,
    'GET /api/posts 401': postsFeedUnauthorizedSchema,
    'POST /api/posts 200': postsCreateSuccessSchema,
    'GET /api/posts/:postId 200': postDetailSchema,
    'POST /api/posts/:postId/comment 200': postCommentSchema,
    'PATCH /api/posts/:postId/react 200': postMutationSuccessSchema,
    'DELETE /api/posts/:postId/react 200': postMutationSuccessSchema,
    'PATCH /api/posts/:postId/vote 200': postMutationSuccessSchema,
    'DELETE /api/posts/:postId/vote 200': postMutationSuccessSchema,
    'GET /api/search 200': searchResponseSchema,
    'GET /api/shares 200': sharesListSuccessSchema,
    'GET /api/shares 401': apiErrorBodySchema,
    'POST /api/shares 200': shareCreateSuccessSchema,
    'PATCH /api/shares/:shareId/react 200': shareDocumentSchema,
    'DELETE /api/shares/:shareId/react 200': shareDocumentSchema,
    'PATCH /api/shares/:shareId/vote 200': shareDocumentSchema,
    'POST /api/shares/:shareId/comment 200': shareCommentSuccessSchema,
    'GET /api/token 200': tokenSuccessSchema,
    'GET /api/token 401': tokenUnauthorizedSchema,
    'GET /api/token 500': tokenServerErrorSchema,
    'PATCH /api/update-cover-photo 200': updateCoverSuccessSchema,
    'PATCH /api/update-photo-collection 200': updatePhotoCollectionUserSchema,
    'PATCH /api/update-profile-picture 200': updateProfileSuccessSchema,
    'POST /api/register 200': registerSuccessSchema,
    'GET /api/users 200': usersListSuccessSchema,
    'GET /api/users/trending 200': usersTrendingSuccessSchema,
    'GET /api/users/trending 401': usersUnauthorizedSchema,
    'GET /api/users/suggested 200': usersSuggestedSuccessSchema,
    'GET /api/users/discover 200': usersDiscoverSuccessSchema,
    'GET /api/users/discover 401': usersUnauthorizedSchema,
    'GET /api/users/people-you-may-know 200':
      usersPeopleYouMayKnowSuccessSchema,
    'GET /api/users/topics-trending 200': topicsTrendingSuccessSchema,
    'PATCH /api/users/password 200': usersPasswordPatchSuccessSchema
  }

  return map[key]
}

describe('MOCK_REST_CATALOG contract alignment', () => {
  it('validates mapped success and error fixtures against Zod contracts', () => {
    const failures: string[] = []

    for (const entry of MOCK_REST_CATALOG) {
      const schema = schemaFor(
        entry.route,
        entry.method,
        entry.status,
        entry.query
      )
      if (!schema) continue

      const result = schema.safeParse(entry.responseBody)
      if (!result.success) {
        const querySuffix = entry.query ? `?${entry.query}` : ''
        const label = `${entry.method} ${entry.route} ${entry.status}${querySuffix}`
        failures.push(`${label}: ${result.error.message}`)
      }
    }

    expect(failures, failures.join('\n')).toEqual([])
  })

  it('follows following-ids fixture matches list schema', () => {
    const listFixture = MOCK_REST_CATALOG.find(
      (e) =>
        e.route === '/api/follows' &&
        e.method === 'GET' &&
        e.status === 200 &&
        !e.query
    )
    expect(listFixture).toBeDefined()
    if (!listFixture) return
    expect(
      followsFollowingIdsSchema.safeParse(listFixture.responseBody).success
    ).toBe(true)
  })

  it('follows profile-count fixture matches profile schema when query has userId', () => {
    const profileFixture = MOCK_REST_CATALOG.find(
      (e) =>
        e.route === '/api/follows' &&
        e.method === 'GET' &&
        e.status === 200 &&
        e.query?.includes('userId=')
    )
    expect(profileFixture).toBeDefined()
    if (!profileFixture) return
    expect(
      followsProfileCountsSchema.safeParse(profileFixture.responseBody).success
    ).toBe(true)
  })
})
