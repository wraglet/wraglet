'use client'

import useUserStore from '@/store/user'

import Avatar from '@/components/Avatar'

import ProfilePictureHover from '@/app/(authenticated)/[username]/_components/ProfilePictureHover'

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
  const storeProfilePictureUrl = useUserStore(
    (state: any) => state.user?.profilePicture?.url
  )

  const defaultProfilePictureUrl =
    userGender === 'Male'
      ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/male-placeholder.png`
      : `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/female-placeholder.png`

  const finalProfilePictureUrl =
    userProfilePictureUrl ?? storeProfilePictureUrl ?? defaultProfilePictureUrl

  return (
    <div className="group relative block">
      <Avatar
        src={finalProfilePictureUrl}
        gender={userGender}
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
