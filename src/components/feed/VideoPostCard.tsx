import type { IPost } from '@/models/Post'

interface VideoPostCardProps {
  post: IPost
}

const VideoPostCard = ({ post }: VideoPostCardProps) => {
  const video = post.content.video
  if (!video?.url) {
    return null
  }

  if (post.moderationStatus === 'pending') {
    return (
      <div className="my-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-4 text-sm text-amber-800">
        Processing your video…
      </div>
    )
  }

  return (
    <div className="my-3 overflow-hidden rounded-md bg-black">
      <video
        controls
        poster={video.posterUrl}
        className="max-h-[480px] w-full"
        preload="metadata"
      >
        <source src={video.url} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
    </div>
  )
}

export default VideoPostCard
