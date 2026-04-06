import Ably from 'ably'

let ablyInstance: Ably.Rest | null = null

export const getAblyInstance = () => {
  if (ablyInstance) {
    return ablyInstance
  }
  const key = process.env.ABLY_API_KEY?.trim()
  if (!key) {
    throw new Error('Missing ABLY_API_KEY environment variable.')
  }
  ablyInstance = new Ably.Rest(key)
  return ablyInstance
}
