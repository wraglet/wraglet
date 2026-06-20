import { Resend } from 'resend'

type ResendGlobal = typeof globalThis & {
  __wragletResendClient?: Resend | null
}

export const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  const g = globalThis as ResendGlobal
  g.__wragletResendClient ??= new Resend(apiKey)
  return g.__wragletResendClient
}

export const getAppBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5000'
  return url.replace(/\/$/, '')
}

export const getEmailFrom = (): string =>
  process.env.EMAIL_FROM ?? 'Wraglet <noreply@wraglet.com>'

export const isEmailSendingEnabled = (): boolean =>
  Boolean(process.env.RESEND_API_KEY)
