import { Gender, Pronoun } from '@/interfaces'

export const MAX_FILE_SIZE = 4194304

/** Max TipTap / block rows per blog (server validation). */
export const MAX_BLOG_CONTENT_BLOCKS = 80

/** Max characters for a blog comment body. */
export const MAX_BLOG_COMMENT_LENGTH = 2000

// Gender constants
export const GENDER_OPTIONS: Gender[] = [
  'Female',
  'Male',
  'Others',
  'Prefer not to say'
]

export const DEFAULT_GENDER: Gender = 'Others'

// Pronoun constants
export const PRONOUN_OPTIONS: Pronoun[] = [
  'She/Her',
  'He/Him',
  'They/Them',
  'Prefer not to say'
]

export const DEFAULT_PRONOUN: Pronoun = 'They/Them'

// Gender to default pronoun mapping
export const GENDER_TO_DEFAULT_PRONOUN: Record<Gender, Pronoun> = {
  Female: 'She/Her',
  Male: 'He/Him',
  Others: 'They/Them',
  'Prefer not to say': 'Prefer not to say'
}
