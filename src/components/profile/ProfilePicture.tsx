'use client'

import type { Gender } from '@/interfaces'

import ProfilePictureHover from '@/components/profile/ProfilePictureHover'
import Avatar from '@/components/shared/Avatar'

interface ProfilePictureProps {
  username: string
  userGender: string
  userProfilePictureUrl: string | null
  isCurrentUser: boolean
}

const ProfilePicture = ({
  username,
  userGender,
  userProfilePictureUrl,
  isCurrentUser
}: ProfilePictureProps) => {
  const defaultProfilePictureUrl =
    userGender === 'Male'
      ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/male-placeholder.png`
      : `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/female-placeholder.png`

  // Use profile picture if it exists, otherwise fallback to default
  const finalProfilePictureUrl =
    userProfilePictureUrl && userProfilePictureUrl !== ''
      ? userProfilePictureUrl
      : defaultProfilePictureUrl

  return (
    <div className="group relative block">
      <Avatar
        src={finalProfilePictureUrl}
        gender={userGender as Gender}
        alt={`${username}'s avatar`}
        size="shadow-md h-[100px] w-[100px] md:h-[160px] md:w-[160px]"
      />
      {isCurrentUser && (
        <ProfilePictureHover profilePicture={finalProfilePictureUrl} />
      )}
    </div>
  )
}

export default ProfilePicture
