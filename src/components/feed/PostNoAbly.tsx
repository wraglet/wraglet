'use client'

import { IPost } from '@/models/Post'

import Post from '@/components/feed/Post'

interface PostNoAblyProps {
  post: IPost
}

const PostNoAbly = ({ post }: PostNoAblyProps) => {
  return <Post post={post} />
}

export default PostNoAbly
