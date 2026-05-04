interface PostVoteCountsProps {
  upvotes: number
  downvotes: number
}

const PostVoteCounts = ({ upvotes, downvotes }: PostVoteCountsProps) => {
  return (
    <span>
      <span className="text-green-600">+{upvotes}</span>
      {' | '}
      <span className="text-red-600">-{downvotes}</span>
    </span>
  )
}

export default PostVoteCounts
