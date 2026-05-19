import getCurrentUser from '@/actions/getCurrentUser'
import { conversationsListSuccessSchema } from '@/contracts/conversations'
import { getConversationUnreadCount } from '@/lib/conversationUnread'
import Conversation from '@/models/Conversation'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Conversation', () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    findById: vi.fn()
  }
}))

vi.mock('@/lib/conversationUnread', () => ({
  getConversationUnreadCount: vi.fn(),
  getTotalUnreadMessageCount: vi.fn()
}))

vi.mock('@/lib/ably', () => ({
  getAblyInstance: vi.fn()
}))

const mockedUser = vi.mocked(getCurrentUser)
const convFind = vi.mocked(Conversation.find)

describe('GET /api/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns { success: true, data } listing conversations', async () => {
    mockedUser.mockResolvedValue({
      _id: { toString: () => 'u1' },
      email: 'x@y.z'
    } as Awaited<ReturnType<typeof mockedUser>>)

    const lean = vi.fn().mockResolvedValue([
      {
        _id: '507f1f77bcf86cd799439040',
        participants: [
          {
            _id: '507f1f77bcf86cd799439099',
            firstName: 'Ada',
            lastName: 'Lovelace',
            username: '@ada',
            gender: 'Female',
            profilePicture: null
          }
        ],
        isGroup: false,
        lastMessage: null,
        updatedAt: new Date()
      }
    ])
    const afterSecondPopulate = { sort: vi.fn().mockReturnValue({ lean }) }
    const afterFirstPopulate = {
      populate: vi.fn().mockReturnValue(afterSecondPopulate)
    }
    const findChain = { populate: vi.fn().mockReturnValue(afterFirstPopulate) }
    convFind.mockReturnValue(findChain as never)

    vi.mocked(getConversationUnreadCount).mockResolvedValue(0)

    const res = await GET(buildAppRouteRequest('/api/conversations'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(conversationsListSuccessSchema.safeParse(body).success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data[0].unreadCount).toBe(0)
  })
})
