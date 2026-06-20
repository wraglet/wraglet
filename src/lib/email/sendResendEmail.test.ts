import {
  logResendSendFailure,
  sendResendEmail
} from '@/lib/email/sendResendEmail'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockSend = vi.fn()

vi.mock('@/lib/email/resendClient', () => ({
  getEmailFrom: () => 'Wraglet <auth@wraglet.com>',
  getResendClient: () => ({ emails: { send: mockSend } }),
  isEmailSendingEnabled: () => true
}))

describe('sendResendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({ data: { id: '1' }, error: null })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws and logs domain verification guidance on Resend recipient restriction', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSend.mockResolvedValue({
      data: null,
      error: {
        message:
          'You can only send testing emails to your own email address (admin@wraglet.com). To send emails to other recipients, please verify a domain at resend.com/domains.'
      }
    })

    await expect(
      sendResendEmail(
        'password reset email',
        {
          to: 'user@gmail.com',
          subject: 'test',
          html: '<p>hi</p>',
          text: 'hi'
        },
        'https://example.com/reset?token=abc'
      )
    ).rejects.toThrow('Failed to send password reset email')

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('wraglet.com is verified'),
      expect.any(Object)
    )
  })

  it('logs dev fallback link when send fails outside production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'delivery failed' }
    })

    await expect(
      sendResendEmail(
        'verification email',
        {
          to: 'user@gmail.com',
          subject: 'test',
          html: '<p>hi</p>',
          text: 'hi'
        },
        'https://example.com/verify?token=abc'
      )
    ).rejects.toThrow()

    expect(consoleInfo).toHaveBeenCalledWith(
      '[email] Dev fallback link (verification email):',
      'https://example.com/verify?token=abc'
    )
  })

  it('logResendSendFailure detects recipient restriction messages', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    logResendSendFailure('password reset email', {
      message: 'only send testing emails to your own email address'
    })

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        'Resend account email until wraglet.com is verified'
      ),
      expect.any(Object)
    )
  })
})
