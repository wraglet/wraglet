import getCurrentUser from '@/actions/getCurrentUser'
import {
  messagesListSuccessSchema,
  messagesMutationSuccessSchema
} from '@/contracts/messages'
import { getAblyInstance } from '@/lib/ably'
import {
  getConversationUnreadCount,
  getTotalUnreadMessageCount
} from '@/lib/conversationUnread'
import Conversation from '@/models/Conversation'
import Message from '@/models/Message'
import { buildAppRouteRequest } from '@/test/handlerRequest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, POST } from './route'

vi.mock('@/lib/db', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/actions/getCurrentUser', () => ({
  default: vi.fn()
}))

vi.mock('@/models/Message', () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
    findById: vi.fn()
  }
}))

vi.mock('@/models/Conversation', () => ({
  default: {
    findByIdAndUpdate: vi.fn(),
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
const messageFind = vi.mocked(Message.find)
const messageCreate = vi.mocked(Message.create)
const messageFindById = vi.mocked(Message.findById)
const convUpdate = vi.mocked(Conversation.findByIdAndUpdate)
const convFindById = vi.mocked(Conversation.findById)
const mockGetAbly = vi.mocked(getAblyInstance)

describe('/api/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET returns 400 without x-conversation-id', async () => {
    const res = await GET(buildAppRouteRequest('/api/messages'))
    expect(res.status).toBe(400)
  })

  it('GET returns { success: true, data } for messages', async () => {
    const lean = vi.fn().mockResolvedValue([])
    messageFind.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({ lean })
      })
    } as never)

    const res = await GET(
      buildAppRouteRequest('/api/messages', {
        headers: { 'x-conversation-id': 'conv-1' }
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(messagesListSuccessSchema.safeParse(body).success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('POST publishes Ably unread updates and returns populated message', async () => {
    process.env.ABLY_API_KEY = 'test-key'
    const publish = vi.fn().mockResolvedValue(undefined)
    mockGetAbly.mockReturnValue({
      channels: {
        get: vi.fn().mockReturnValue({ publish })
      }
    } as never)

    mockedUser.mockResolvedValue({
      _id: { toString: () => 'sender' },
      email: 'a@b.c'
    } as Awaited<ReturnType<typeof mockedUser>>)

    messageCreate.mockResolvedValue({ _id: 'm1' } as never)
    messageFindById.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd7994390bb',
          conversation: '507f1f77bcf86cd799439040',
          content: 'hello',
          attachments: [],
          sender: {
            _id: '507f1f77bcf86cd799439099',
            firstName: 'S',
            lastName: 'Test',
            username: '@s',
            gender: 'Female',
            profilePicture: null
          }
        })
      })
    } as never)
    convUpdate.mockResolvedValue({} as never)
    convFindById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        participants: [
          { toString: () => 'other' },
          { toString: () => 'sender' }
        ]
      })
    } as never)
    vi.mocked(getConversationUnreadCount).mockResolvedValue(1)
    vi.mocked(getTotalUnreadMessageCount).mockResolvedValue(2)

    const res = await POST(
      buildAppRouteRequest('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'conv-1',
          content: 'hello'
        })
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(messagesMutationSuccessSchema.safeParse(body).success).toBe(true)
    expect(body.data.content).toBe('hello')

    expect(publish).toHaveBeenCalled()
  })
})
