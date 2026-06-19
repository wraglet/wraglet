import { z } from 'zod'

/** Shared password rules for signup, reset, and account settings. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[@$!%*?&#]/,
    'Password must contain at least one special character (@$!%*?&#)'
  )

export type PasswordValue = z.infer<typeof passwordSchema>
