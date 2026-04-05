/** Mutable subset used by `Blog` `pre('save')` (unit-tested without Mongo). */
export type BlogPreSaveDoc = {
  isModified: (path: string) => boolean
  contentBlocks?: Array<{
    type: string
    content?: string
    order: number
    id: string
  }>
  status?: string
  publishedAt?: Date
  readTime: number
}

export const applyBlogPreSaveSideEffects = (doc: BlogPreSaveDoc): void => {
  if (doc.isModified('contentBlocks') && doc.contentBlocks) {
    const textContent = doc.contentBlocks
      .filter((block) => block.type === 'text')
      .map((block) => block.content)
      .join(' ')
    const wordCount = textContent.split(/\s+/).length
    doc.readTime = Math.max(1, Math.ceil(wordCount / 200))
  }

  if (
    doc.isModified('status') &&
    doc.status === 'published' &&
    !doc.publishedAt
  ) {
    doc.publishedAt = new Date()
  }
}
