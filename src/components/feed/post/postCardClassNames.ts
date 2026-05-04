const ACTION_PILL_BASE =
  'flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors'

export const ACTION_PILL_NEUTRAL = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:bg-gray-50`
export const ACTION_PILL_UPVOTE = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:border-green-500 hover:bg-green-50`
export const ACTION_PILL_UPVOTE_ACTIVE = `${ACTION_PILL_BASE} border-green-500 bg-green-50 text-green-600`
export const ACTION_PILL_DOWNVOTE = `${ACTION_PILL_BASE} border-gray-400 text-gray-600 hover:border-red-500 hover:bg-red-50`
export const ACTION_PILL_DOWNVOTE_ACTIVE = `${ACTION_PILL_BASE} border-red-500 bg-red-50 text-red-600`

export const COMMENT_INPUT_CLASS =
  'h-[30px] w-full rounded-full border-none bg-[#E7ECF0] px-3 text-xs shadow-none'

/** Matches `Avatar` default `h-9 w-9` and menu button `h-8 w-8` for footer row alignment */
export const postCardAvatarSlotClass = 'w-9 shrink-0'
export const postCardMenuSlotClass = 'w-8 shrink-0'
