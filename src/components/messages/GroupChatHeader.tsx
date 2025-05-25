import Avatar from '@/components/Avatar'

interface User {
  _id: string
  firstName: string
  lastName: string
  username: string
  profilePicture?: string
  gender?: string
}

interface GroupChatHeaderProps {
  participants: User[]
  isGroup: boolean
}

function getProfilePictureUrl(profilePicture: any): string | null {
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

const CollageAvatar = ({ users }: { users: User[] }) => {
  // Show up to 3 avatars in a collage
  const avatars = users.slice(0, 3)
  return (
    <div className="relative h-12 w-12">
      {avatars.map((user, i) => (
        <div
          key={user._id}
          className={`absolute rounded-full border-2 border-white bg-white ${
            i === 0
              ? 'top-0 left-0 z-30'
              : i === 1
                ? 'top-0 left-4 z-20'
                : 'top-4 left-2 z-10'
          }`}
          style={{ width: 32, height: 32 }}
        >
          <Avatar
            src={getProfilePictureUrl(user.profilePicture)}
            gender={user.gender}
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

const GroupChatHeader = ({ participants, isGroup }: GroupChatHeaderProps) => {
  if (!isGroup && participants.length === 1) {
    const user = participants[0]
    return (
      <div className="sticky top-0 z-10 mt-14 flex items-center border-b bg-white/80 px-6 py-3 backdrop-blur">
        <Avatar
          src={getProfilePictureUrl(user.profilePicture)}
          gender={user.gender}
          alt={user.firstName}
          className="mr-3 h-9 w-9 border-2 border-white"
        />
        <div className="flex flex-col justify-center">
          <span className="leading-tight font-semibold text-gray-900">
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
    <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-white/80 px-4 py-3 backdrop-blur">
      <CollageAvatar users={participants} />
      <div className="flex flex-col">
        <div className="flex flex-wrap gap-x-2">
          {participants.map((user) => (
            <span key={user._id} className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
              <span className="ml-1 text-sm text-gray-500">
                @{user.username}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupChatHeader
