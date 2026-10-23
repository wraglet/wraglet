import { BLOCKED_HOSTNAMES, BLOCKED_TLDS } from '@/lib/moderation/constants'

const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9-]+\.)+(?:com|org|net|io|co|xxx|porn|adult|sex|cam)[^\s<>"']*/gi

const DANGEROUS_SCHEMES = /^(javascript|data|vbscript):/i

const isIpLiteralHost = (hostname: string): boolean =>
  /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || /^\[[0-9a-f:]+\]$/i.test(hostname)

const hostnameBlockedByTld = (hostname: string): boolean =>
  BLOCKED_TLDS.some((tld) => hostname.endsWith(tld))

export const extractUrls = (text: string): string[] => {
  if (!text?.trim()) {
    return []
  }

  const matches = text.match(URL_PATTERN) ?? []
  return [...new Set(matches)]
}

const normalizeUrlForCheck = (raw: string): URL | null => {
  const trimmed = raw.trim()
  const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`

  try {
    return new URL(withScheme)
  } catch {
    return null
  }
}

export const isBlockedUrl = (raw: string): boolean => {
  if (DANGEROUS_SCHEMES.test(raw.trim())) {
    return true
  }

  const parsed = normalizeUrlForCheck(raw)
  if (!parsed) {
    return false
  }

  if (DANGEROUS_SCHEMES.test(parsed.protocol)) {
    return true
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '')

  if (isIpLiteralHost(hostname)) {
    return true
  }

  if (hostnameBlockedByTld(hostname)) {
    return true
  }

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return true
  }

  // Basic homograph / punycode check — block non-ASCII hostnames in public links
  if (/[^\x00-\x7F]/.test(hostname)) {
    return true
  }

  return false
}

export const containsBlockedLinks = (text: string): boolean =>
  extractUrls(text).some(isBlockedUrl)
