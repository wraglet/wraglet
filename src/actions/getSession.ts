import { auth } from "@/auth"

const getSession = async () => {
  try {
    const session = await auth()
    return session
  } catch (err) {
    console.error('Error while getting session: ', err)
    return null 
  }
}

export default getSession
