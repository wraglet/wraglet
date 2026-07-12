export type ProfileFeedItem = {
  type: 'post' | 'share'
  data: Record<string, unknown>
  createdAt: Date | string
}
