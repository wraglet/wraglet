import type { IPost } from '@/models/Post'

const PREVIEW_MAX = 50

/** Plain-text snippet for activity cards and similar UI (Post.content is an object, not a string). */
export const getPostContentPreviewSnippet = (
  content: IPost['content'] | string | null | undefined
): string => {
  if (content == null) {
    return ''
  }
  if (typeof content === 'string') {
    const t = content.trim()
    if (!t) {
      return ''
    }
    return t.length <= PREVIEW_MAX ? t : `${t.slice(0, PREVIEW_MAX)}...`
  }

  const parts: string[] = []
  const text = content.text?.trim()
  if (text) {
    parts.push(text)
  }
  const title = content.blogPreview?.title?.trim()
  if (title) {
    parts.push(`Blog: ${title}`)
  }

  const combined = parts.join(' · ')
  if (!combined) {
    return ''
  }
  return combined.length <= PREVIEW_MAX
    ? combined
    : `${combined.slice(0, PREVIEW_MAX)}...`
}
