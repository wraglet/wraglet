import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export default async function GetSession() {
  try {
    const session = await getServerSession(authOptions)
    return session // Return the session directly
  } catch (err) {
    console.error('Error while getting session: ', err)
    return null // Return null on error for better handling
  }
}
