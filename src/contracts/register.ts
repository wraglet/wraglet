import { z } from 'zod'

/** Loose success body from `POST /api/register` (Mongoose user doc serialized to JSON). */
export const registerCreatedUserSchema = z
  .object({
    _id: z.string(),
    email: z.string(),
    username: z.string()
  })
  .passthrough()

export type RegisterCreatedUser = z.infer<typeof registerCreatedUserSchema>
