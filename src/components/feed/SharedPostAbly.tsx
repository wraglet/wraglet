'use client'

import { IPost } from '@/models/Post'
import { IShare } from '@/models/Share'

import SharedPost from '@/components/feed/SharedPost'

interface SharedPostAblyProps {
  share: IShare & {
    originalPost: IPost
    sharedBy: {
      _id: string
      firstName: string
      lastName: string
      username: string
      gender: string
      profilePicture?: {
        url: string
      } | null
    }
  }
}

const SharedPostAbly = ({ share }: SharedPostAblyProps) => {
  // Since we're already wrapped in the global AblyProvider from the layout,
  // we can directly render the shared post component
  return <SharedPost share={share} />
}

export default SharedPostAbly
