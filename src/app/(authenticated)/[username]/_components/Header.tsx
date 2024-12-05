import Image from 'next/image'
import getUserByUsername from '@/actions/getUserByUsername'
import { FaPencil, FaUserPen } from 'react-icons/fa6'

import Avatar from '@/components/Avatar'

import CoverPhotoHover from '@/app/(authenticated)/[username]/_components/CoverPhotoHover'
import ProfilePictureHover from '@/app/(authenticated)/[username]/_components/ProfilePictureHover'

const ProfileHeader = async ({ username }: { username: string }) => {
  const user = await getUserByUsername(username)

  const isCurrentUser = user?.isCurrentUser

  const profilePictureUrl = user?.profilePicture?.url
  const defaultProfilePictureUrl =
    user?.gender === 'Male'
      ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/male-placeholder.png`
      : `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/female-placeholder.png`

  const finalProfilePictureUrl = profilePictureUrl ?? defaultProfilePictureUrl

  return (
    <>
      <section className="mt-14 flex h-auto w-full flex-col items-center bg-white shadow-md lg:rounded-md xl:w-[1250px]">
        <div className="relative block h-[114px] w-full md:h-[284px] lg:h-[360px]">
          <div className="group relative block h-[114px] w-full md:h-[284px] lg:h-[360px]">
            <Image
              fill
              src={
                user?.coverPhoto?.url ??
                `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/cover-photo-default.jpg`
              }
              alt={
                user?.coverPhoto
                  ? `${user.firstName}'s cover photo`
                  : `User's default cover photo`
              }
            />
            {isCurrentUser && <CoverPhotoHover />}
          </div>

          <div className="absolute -bottom-[50px] left-4 z-10 overflow-hidden md:-bottom-[80px] lg:-bottom-[90px] lg:left-16">
            <div className="group relative block">
              <Avatar
                src={finalProfilePictureUrl}
                gender={user?.gender}
                alt={`${user?.firstName}'s avatar`}
                size="shadow-md h-[100px] w-[100px] md:h-[160px] md:w-[160px]"
              />
              {isCurrentUser && (
                <ProfilePictureHover profilePicture={finalProfilePictureUrl} />
              )}
            </div>
          </div>
        </div>
        <div className="relative flex h-[90px] w-full flex-col justify-between md:h-[120px] lg:h-[140px]">
          <div className="ml-[132px] mr-4 mt-1 flex items-center justify-between md:ml-[180px] md:mt-5 lg:ml-[242px] lg:mt-10">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold -tracking-[0.4px] text-black">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-x-2 text-[10px] font-semibold -tracking-[0.2px] text-zinc-500">
                <span>{user?.friends?.length} friends</span>{' '}
                <span>{user?.following?.length} following</span>
              </div>
            </div>
            <span className="self-end text-xl text-slate-700">
              <FaUserPen />
            </span>
          </div>
          <div className="ml-[35px] pb-4 md:ml-[180px] md:pb-7 lg:ml-[242px] lg:pb-[30px]">
            <div className="flex gap-x-4">
              <p className="text-xs font-medium italic text-slate-700">
                &quot;{user?.bio ?? 'Set your bio here'}&quot;
              </p>
              <FaPencil className="text-slate-600" size={10} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProfileHeader
