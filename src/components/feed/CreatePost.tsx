'use client'

import { ChangeEvent, FormEvent, useReducer } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Gender } from '@/interfaces'
import { profileHrefFromUsername } from '@/lib/profileHref'
import useBlogModalStore from '@/store/blogModal'
import useUserStore from '@/store/user'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { BsSend } from 'react-icons/bs'

import UploadPostImage from '@/components/feed/UploadPostImage'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

const MAX_POST_CHARACTERS = 280

type Props = {
  submitPost: (e: FormEvent) => Promise<void>
  isLoading: boolean
  setText: (e: ChangeEvent<HTMLTextAreaElement>) => void
  setPostImage: (postImage: string) => void
  text: string
  postImage: string | null
}

const CreatePost = ({
  submitPost,
  isLoading,
  setText,
  text,
  postImage,
  setPostImage
}: Props) => {
  const { user } = useUserStore()
  const { openModal: openBlogModal } = useBlogModalStore()

  type UploadModalState = { openUploadModal: boolean }
  type UploadModalAction = Partial<UploadModalState>

  const reducer = (state: UploadModalState, action: UploadModalAction) => ({
    ...state,
    ...action
  })

  const initialState: UploadModalState = {
    openUploadModal: false
  }

  const [{ openUploadModal }, dispatchState] = useReducer(reducer, initialState)

  const currentUserProfileHref = user?.username
    ? profileHrefFromUsername(user.username)
    : null

  const characterCount = text.length
  const charactersRemaining = MAX_POST_CHARACTERS - characterCount
  const isOverLimit = characterCount > MAX_POST_CHARACTERS
  const isNearLimit = charactersRemaining <= 20 && charactersRemaining > 0

  const getCharacterCounterColor = () => {
    if (isOverLimit) return 'text-red-500'
    if (isNearLimit) return 'text-orange-500'
    return 'text-gray-500'
  }

  const canSubmit =
    (text.trim() !== '' || (postImage != null && postImage.trim() !== '')) &&
    !isOverLimit &&
    !isLoading

  return (
    <>
      <UploadPostImage
        postImage={postImage ?? ''}
        show={openUploadModal}
        close={() => dispatchState({ openUploadModal: false })}
        setPostImage={setPostImage}
      />
      <div className="rounded-xl border border-sky-200/90 bg-gradient-to-br from-sky-50 via-white to-violet-50/80 p-2.5 shadow-sm ring-1 ring-sky-100/60 sm:p-4">
        <div className="flex w-full items-start gap-2">
          <div className="relative shrink-0 pt-0.5">
            {user && user.gender ? (
              currentUserProfileHref ? (
                <Link
                  href={currentUserProfileHref}
                  className="block rounded-full ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9]/40"
                >
                  <Avatar
                    gender={user.gender as Gender}
                    alt={`${user.firstName}'s photo`}
                    src={user.profilePicture?.url || null}
                    size="h-10 w-10"
                  />
                </Link>
              ) : (
                <Avatar
                  gender={user.gender as Gender}
                  alt={`${user.firstName}'s photo`}
                  src={user.profilePicture?.url || null}
                  size="h-10 w-10"
                />
              )
            ) : (
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            )}
          </div>

          <form
            onSubmit={submitPost}
            className="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2"
          >
            <div>
              <label htmlFor="create-post-text" className="sr-only">
                Post content
              </label>
              <textarea
                id="create-post-text"
                value={text}
                onChange={setText}
                maxLength={MAX_POST_CHARACTERS + 50}
                rows={2}
                placeholder="How's your day? Share a thought, a picture—or both."
                aria-label="Create post text"
                className={`min-h-[3.25rem] w-full max-w-full resize-y rounded-xl border px-2.5 py-2 text-sm leading-snug transition placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 focus:outline-none sm:min-h-[4.5rem] sm:px-3 sm:py-2.5 ${
                  isOverLimit
                    ? 'border-red-300 bg-red-50/90 text-red-900 focus:border-red-400 focus:ring-red-200'
                    : 'border-white/80 bg-white/70 text-gray-900 shadow-sm focus:border-sky-400 focus:bg-white focus:ring-sky-200/80'
                }`}
              />
              {characterCount > 0 && (
                <div className="mt-1 flex justify-end">
                  <span
                    className={`text-xs font-medium tabular-nums ${getCharacterCounterColor()}`}
                  >
                    {isOverLimit
                      ? `${Math.abs(charactersRemaining)} over`
                      : `${charactersRemaining} left`}
                  </span>
                </div>
              )}
            </div>

            {postImage ? (
              <div className="overflow-hidden rounded-xl border border-white/60 bg-white/50 shadow-sm">
                <Image
                  src={postImage}
                  alt="Attachment preview"
                  sizes="(max-width: 768px) 100vw, 42rem"
                  width={800}
                  height={450}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => dispatchState({ openUploadModal: true })}
                title="Add image"
                aria-label="Add image to post"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-200/80 bg-white/90 text-sky-600 shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:border-sky-400 hover:bg-white hover:text-sky-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 sm:h-10 sm:w-10"
              >
                <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </button>

              <div className="flex items-center justify-end gap-2 sm:justify-end">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:from-sky-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:border disabled:border-neutral-200 disabled:bg-neutral-100 disabled:bg-none disabled:text-neutral-500 disabled:shadow-none"
                >
                  {isLoading ? (
                    <span>Posting…</span>
                  ) : (
                    <>
                      <BsSend className="text-base opacity-90" aria-hidden />
                      <span>Post</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="hidden text-left text-xs text-gray-500 sm:block">
              Long-form idea?{' '}
              <Button
                type="button"
                onClick={openBlogModal}
                className="font-medium text-sky-600 underline decoration-sky-300/50 underline-offset-2 transition hover:text-sky-800 hover:decoration-sky-500/60"
              >
                Write a blog
              </Button>{' '}
              instead—rich text, cover, and categories.
            </p>
            <p className="text-left sm:hidden">
              <Button
                type="button"
                onClick={openBlogModal}
                className="text-[10px] font-medium text-sky-600 underline decoration-sky-300/50 underline-offset-2"
              >
                Write a blog
              </Button>
              <span className="text-[10px] text-gray-500"> · longer posts</span>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreatePost
