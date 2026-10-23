import { NextResponse } from 'next/server'
import { MODERATION_VIOLATION_MESSAGE } from '@/lib/moderation/constants'
import { containsBlockedLinks } from '@/lib/moderation/linkModeration'
import { containsProfanity } from '@/lib/moderation/textModeration'

import { MAX_POST_TEXT_LENGTH } from '@/data/constants'

export type ModerationViolationReason = 'text' | 'link' | 'length'

export type ModerationCheckResult =
  | { ok: true }
  | { ok: false; reason: ModerationViolationReason }

export const moderateTextFields = (
  fields: Array<string | undefined | null>,
  options?: { maxLength?: number }
): ModerationCheckResult => {
  const maxLength = options?.maxLength

  for (const field of fields) {
    if (!field?.trim()) {
      continue
    }

    if (maxLength !== undefined && field.length > maxLength) {
      return { ok: false, reason: 'length' }
    }

    if (containsProfanity(field)) {
      return { ok: false, reason: 'text' }
    }

    if (containsBlockedLinks(field)) {
      return { ok: false, reason: 'link' }
    }
  }

  return { ok: true }
}

export const moderatePostText = (text?: string | null): ModerationCheckResult =>
  moderateTextFields([text], { maxLength: MAX_POST_TEXT_LENGTH })

export const moderationViolationResponse = () =>
  NextResponse.json({ error: MODERATION_VIOLATION_MESSAGE }, { status: 400 })

export const stripHtmlTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export type BlogContentBlock = {
  type: string
  content?: string
  metadata?: { url?: string; caption?: string }
}

export const moderateBlogContent = (input: {
  title?: string
  summary?: string
  contentBlocks?: BlogContentBlock[]
}): ModerationCheckResult => {
  const textFields: string[] = []

  if (input.title) {
    textFields.push(input.title)
  }
  if (input.summary) {
    textFields.push(input.summary)
  }

  for (const block of input.contentBlocks ?? []) {
    if (block.type === 'text' || block.type === 'code') {
      if (block.content) {
        textFields.push(
          block.type === 'text' ? stripHtmlTags(block.content) : block.content
        )
        textFields.push(block.content)
      }
    }

    if (block.metadata?.url) {
      textFields.push(block.metadata.url)
    }
    if (block.metadata?.caption) {
      textFields.push(block.metadata.caption)
    }
  }

  return moderateTextFields(textFields)
}
