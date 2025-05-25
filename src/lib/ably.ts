import Ably from 'ably'

let ablyInstance: Ably.Rest | null = null

export const getAblyInstance = () => {
  if (!ablyInstance) {
    ablyInstance = new Ably.Rest(process.env.ABLY_API_KEY!)
  }
  return ablyInstance
}
