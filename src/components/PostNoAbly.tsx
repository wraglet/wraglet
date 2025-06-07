'use client'

import { IPost } from '@/models/Post'

import Post from '@/components/Post'

interface PostNoAblyProps {
  post: IPost
}

const PostNoAbly = ({ post }: PostNoAblyProps) => {
  return <Post post={post} />
}

export default PostNoAbly
