import type { Gender } from '@/interfaces'
import { getStackedAvatarPositionClass } from '@/utils/displayFormat'

import type { IParticipant } from '@/types/conversation'
import ChatHeaderBackButton from '@/components/chat/ChatHeaderBackButton'
import Avatar from '@/components/shared/Avatar'
import AvatarWithOnlineBadge from '@/components/shared/AvatarWithOnlineBadge'

const defaultParticipantGender: Gender = 'Male'

interface GroupChatHeaderProps {
  participants: IParticipant[]
  isGroup: boolean
  onBack?: () => void
}

const getProfilePictureUrl = (
  profilePicture: string | { url: string } | undefined
): string | null => {
  if (
    profilePicture &&
    typeof profilePicture === 'object' &&
    'url' in profilePicture
  ) {
    return profilePicture.url
  }
  if (typeof profilePicture === 'string') {
    return profilePicture
  }
  return null
}

const CollageAvatar = ({ users }: { users: IParticipant[] }) => {
  // Show up to 3 avatars in a collage
  const avatars = users.slice(0, 3)
  return (
    <div className="relative h-12 w-12">
      {avatars.map((user, i) => (
        <div
          key={user._id}
          className={`absolute rounded-full border-2 border-white bg-white ${getStackedAvatarPositionClass(i, 'sm')}`}
          style={{ width: 32, height: 32 }}
        >
          <Avatar
            src={getProfilePictureUrl(user.profilePicture)}
            gender={defaultParticipantGender}
            alt={user.firstName}
            className="h-8 w-8"
          />
        </div>
      ))}
      {users.length > 3 && (
        <span className="absolute -right-2 -bottom-2 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white shadow">
          +{users.length - 3}
        </span>
      )}
    </div>
  )
}

const GroupChatHeader = ({
  participants,
  isGroup,
  onBack
}: GroupChatHeaderProps) => {
  const dmHeaderPadding = onBack ? 'px-2 py-3 lg:px-6' : 'px-6 py-3'
  const groupHeaderPadding = onBack ? 'px-2 py-3 lg:px-4' : 'px-4 py-3'

  if (!isGroup && participants.length === 1) {
    const user = participants[0]
    return (
      <div
        className={`sticky top-0 z-10 flex min-w-0 items-center border-b bg-white/80 backdrop-blur ${dmHeaderPadding}`}
      >
        {onBack ? <ChatHeaderBackButton onBack={onBack} /> : null}
        <AvatarWithOnlineBadge userId={user._id} className="mr-3">
          <Avatar
            src={getProfilePictureUrl(user.profilePicture)}
            gender={defaultParticipantGender}
            alt={user.firstName}
            className="h-9 w-9 shrink-0 border-2 border-white"
          />
        </AvatarWithOnlineBadge>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="truncate leading-tight font-semibold text-gray-900">
            {user.firstName} {user.lastName}
            <span className="ml-2 align-middle text-sm font-normal text-gray-500">
              {user.username}
            </span>
          </span>
        </div>
      </div>
    )
  }
  // Group chat: collage avatar and all names
  return (
    <div
      className={`sticky top-0 z-10 flex min-w-0 items-center gap-2 border-b bg-white/80 backdrop-blur ${groupHeaderPadding}`}
    >
      {onBack ? <ChatHeaderBackButton onBack={onBack} /> : null}
      <CollageAvatar users={participants} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap gap-x-2">
          {participants.map((user) => (
            <span key={user._id} className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
              <span className="ml-1 text-sm text-gray-500">
                {user.username}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupChatHeader
