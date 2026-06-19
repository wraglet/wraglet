/** Shared control sizing for unauthenticated auth forms — keep Storybook Input docs in sync. */
const authFormControlClassName =
  'h-12 w-full rounded-lg border border-neutral-200 bg-white px-3 py-0 text-sm shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300'

/** Text inputs on login, register, forgot-password, and reset-password. */
export const authFormInputClassName =
  `${authFormControlClassName} relative cursor-default appearance-none text-left` as const

/** Select/listbox controls on register (birthday, gender, pronoun). */
export const authFormListBoxClassName =
  `${authFormControlClassName} relative cursor-default pr-10 text-left` as const
