import Link from 'next/link'
import type { Gender } from '@/interfaces'
import type { User } from '@/store/user'
import { formatUserPhotoAlt } from '@/utils/displayFormat'

import Avatar from '@/components/shared/Avatar'

interface CurrentUserAvatarProps {
  user: User | null
  profileHref: string | null
  size?: string
  alt?: string
  linkClassName?: string
}

const CurrentUserAvatar = ({
  user,
  profileHref,
  size = 'h-10 w-10',
  alt,
  linkClassName = 'block rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40'
}: CurrentUserAvatarProps) => {
  if (!user?.gender) {
    return (
      <div
        className={`${size} animate-pulse rounded-full bg-gray-200`}
        aria-hidden
      />
    )
  }

  const avatarAlt = alt ?? formatUserPhotoAlt(user.firstName, user.lastName)
  const avatar = (
    <Avatar
      gender={user.gender as Gender}
      alt={avatarAlt}
      src={user.profilePicture?.url || null}
      size={size}
    />
  )

  if (profileHref) {
    return (
      <Link href={profileHref} className={linkClassName}>
        {avatar}
      </Link>
    )
  }

  return avatar
}

export default CurrentUserAvatar
