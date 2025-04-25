'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import getUserByUsername from '@/actions/getUserByUsername'
import { useFollow } from '@/lib/hooks/useFollow'
import { useQuery } from '@tanstack/react-query'
import { FaPencil, FaUserPen } from 'react-icons/fa6'

import CoverPhotoHover from '@/app/(authenticated)/[username]/_components/CoverPhotoHover'
import ProfilePicture from '@/app/(authenticated)/[username]/_components/ProfilePicture'

const ProfileHeader = ({ username }: { username: string }) => {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const { data: user, isLoading } = useQuery({
    queryKey: ['profileUser', username],
    queryFn: () => getUserByUsername(username)
  })

  const isCurrentUser = user?.isCurrentUser
  const {
    isFollowing,
    followersCount,
    followingCount,
    follow,
    unfollow,
    loading
  } = useFollow(user?._id)

  if (isLoading || !user) return null

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
            {isCurrentUser && (
              <CoverPhotoHover coverPhoto={user?.coverPhoto?.url} />
            )}
          </div>

          <div className="absolute -bottom-[50px] left-4 z-10 overflow-hidden md:-bottom-[80px] lg:-bottom-[90px] lg:left-16">
            <ProfilePicture
              username={username}
              userGender={user?.gender}
              userProfilePictureUrl={user?.profilePicture?.url}
              isCurrentUser={isCurrentUser}
            />
          </div>
        </div>
        <div className="relative flex h-[90px] w-full flex-col justify-between md:h-[120px] lg:h-[140px]">
          <div className="mt-1 mr-4 ml-[132px] flex items-center justify-between md:mt-5 md:ml-[180px] lg:mt-10 lg:ml-[242px]">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold -tracking-[0.4px] text-black">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-x-2 text-[10px] font-semibold -tracking-[0.2px] text-zinc-500">
                <span>{followersCount} followers</span>
                <span>·</span>
                <span>{followingCount} following</span>
              </div>
            </div>
            {!isCurrentUser &&
              (isFollowing ? (
                <button
                  className="rounded-full bg-gray-200 px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={() => unfollow()}
                  disabled={loading}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-500 hover:text-white"
                  onClick={() => follow()}
                  disabled={loading}
                >
                  Follow
                </button>
              ))}
            {isCurrentUser && (
              <span className="self-end text-xl text-slate-700">
                <FaUserPen />
              </span>
            )}
          </div>
          <div className="ml-[35px] pb-4 md:ml-[180px] md:pb-7 lg:ml-[242px] lg:pb-[30px]">
            <div className="flex gap-x-4">
              <p className="text-xs font-medium text-slate-700 italic">
                &quot;{user?.bio ?? 'Set your bio here'}&quot;
              </p>
              {isCurrentUser && (
                <FaPencil className="text-slate-600" size={10} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProfileHeader
