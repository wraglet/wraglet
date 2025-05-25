'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import getUserByUsername from '@/actions/getUserByUsername'
import { useFollow } from '@/lib/hooks/useFollow'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaPencil, FaUserPen } from 'react-icons/fa6'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'

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

  const queryClient = useQueryClient()
  const [editingBio, setEditingBio] = useState(false)
  const form = useForm({
    defaultValues: { bio: user?.bio ?? '' }
  })

  useEffect(() => {
    form.reset({ bio: user?.bio ?? '' })
  }, [user?.bio, form])

  const { mutate: updateBio, isPending: updatingBio } = useMutation({
    mutationFn: async (data: { bio: string }) => {
      const res = await axios.patch('/api/users', { bio: data.bio })
      return res.data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileUser', username] })
      toast.success('Bio updated!')
      setEditingBio(false)
    },
    onError: () => {
      toast.error('Failed to update bio')
    }
  })

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
              <Link href="/settings/profile" passHref legacyBehavior>
                <a
                  className="self-end text-xl text-slate-700 hover:text-blue-600 focus:text-blue-700 focus:outline-none"
                  aria-label="Edit Profile Settings"
                >
                  <FaUserPen />
                </a>
              </Link>
            )}
          </div>
          <div className="ml-[35px] pb-4 md:ml-[180px] md:pb-7 lg:ml-[242px] lg:pb-[30px]">
            <div className="flex gap-x-4">
              {editingBio ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => updateBio(data))}
                    className="flex items-center gap-x-2"
                  >
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="w-60">
                          <FormControl>
                            <input
                              className="h-7 w-60 border-b border-slate-400 bg-transparent px-2 py-1 text-xs focus:outline-none"
                              maxLength={300}
                              disabled={updatingBio}
                              {...field}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setEditingBio(false)
                                  form.reset({ bio: user?.bio ?? '' })
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      type="submit"
                      className="rounded px-1 py-0.5 text-xs text-sky-600 hover:underline disabled:opacity-50"
                      disabled={updatingBio}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded px-1 py-0.5 text-xs text-gray-500 hover:underline"
                      onClick={() => {
                        setEditingBio(false)
                        form.reset({ bio: user?.bio ?? '' })
                      }}
                      disabled={updatingBio}
                    >
                      Cancel
                    </button>
                  </form>
                </Form>
              ) : (
                <>
                  <p className="text-xs font-medium text-slate-700 italic">
                    &quot;{user?.bio ?? 'Set your bio here'}&quot;
                  </p>
                  {isCurrentUser && (
                    <button
                      type="button"
                      aria-label="Edit bio"
                      onClick={() => setEditingBio(true)}
                      className="ml-1 h-6 w-6 p-1 text-slate-600 hover:text-sky-600"
                    >
                      <FaPencil size={10} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProfileHeader
