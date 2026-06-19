import { z } from 'zod'

/** Success body from `POST /api/register` after trust signup. */
export const registerSuccessSchema = z.object({
  message: z.string(),
  email: z.string().email()
})

export type RegisterSuccess = z.infer<typeof registerSuccessSchema>
