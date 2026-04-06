import {
  applyBlogPreSaveSideEffects,
  type BlogPreSaveDoc
} from '@/models/blogPreSave'

/** Mongoose `pre('save')` handler (kept separate so it can be unit-tested). */
export const blogDocumentPreSave = function (
  this: BlogPreSaveDoc,
  next: (err?: Error) => void
): void {
  applyBlogPreSaveSideEffects(this)
  next()
}
