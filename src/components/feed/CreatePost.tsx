'use client'

import { ChangeEvent, FormEvent, useReducer } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useUserStore from '@/store/user'
import { BsSend } from 'react-icons/bs'
import { HiOutlinePlayCircle } from 'react-icons/hi2'

import UploadPostImage from '@/components/feed/UploadPostImage'
import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'
import { GalleryIcon, TerminalIcon } from '@/components/shared/Icons'

// Constants for character limits
const MAX_POST_CHARACTERS = 280

type Props = {
  submitPost: (e: FormEvent) => Promise<void>
  isLoading: boolean
  setText: (e: ChangeEvent<HTMLInputElement>) => void
  setPostImage: (postImage: string) => void
  text: string
  postImage: string
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

  const reducer = (state: any, action: any) => ({ ...state, ...action })

  const initialState = {
    openUploadModal: false
  }

  const [{ openUploadModal }, dispatchState] = useReducer(reducer, initialState)

  const characterCount = text.length
  const charactersRemaining = MAX_POST_CHARACTERS - characterCount
  const isOverLimit = characterCount > MAX_POST_CHARACTERS
  const isNearLimit = charactersRemaining <= 20 && charactersRemaining > 0

  // Get character counter color based on remaining characters
  const getCharacterCounterColor = () => {
    if (isOverLimit) return 'text-red-500'
    if (isNearLimit) return 'text-orange-500'
    return 'text-gray-500'
  }

  return (
    <>
      <UploadPostImage
        postImage={postImage}
        show={openUploadModal}
        close={() => dispatchState({ openUploadModal: false })}
        setPostImage={setPostImage}
      />
      <div className="flex w-full grow items-start border border-solid border-neutral-200 bg-white drop-shadow-md sm:rounded-lg">
        <div className="flex w-full gap-x-2 px-4 py-3">
          <div className="relative block">
            {user && user.gender ? (
              <Avatar
                gender={user.gender}
                alt={`${user.firstName}'s photo`}
                src={user.profilePicture?.url || null}
              />
            ) : (
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
            )}
          </div>
          <form
            onSubmit={submitPost}
            className="flex grow flex-col justify-start gap-y-1.5"
          >
            <div className="relative">
              <input
                type="text"
                value={text}
                className={`h-[30px] w-full rounded-2xl border border-solid px-2 text-sm drop-shadow-md focus:outline-hidden ${
                  isOverLimit
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-[#E5E5E5] bg-[#E7ECF0] text-[#333333]'
                }`}
                placeholder="Wanna share something up?"
                onChange={setText}
                maxLength={MAX_POST_CHARACTERS + 50} // Allow typing beyond limit for visual feedback
              />
              {characterCount > 0 && (
                <div className="mt-1 flex items-center justify-between">
                  <div></div>
                  <span
                    className={`text-xs font-medium ${getCharacterCounterColor()}`}
                  >
                    {isOverLimit
                      ? `-${Math.abs(charactersRemaining)}`
                      : charactersRemaining}
                  </span>
                </div>
              )}
            </div>
            {postImage && (
              <div className="my-3 block overflow-hidden rounded-md">
                <Image
                  src={postImage}
                  alt="Post Image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  width={1}
                  height={1}
                  style={{
                    height: 'auto',
                    width: '100%'
                  }}
                />
              </div>
            )}
            <div className="flex items-center gap-x-1">
              <HiOutlinePlayCircle className="h-6 w-6 text-sky-500" />
              <GalleryIcon
                className="h-6 w-auto cursor-pointer text-sky-500"
                onClick={() => dispatchState({ openUploadModal: true })}
              />
              <TerminalIcon className="h-6 w-auto text-sky-500" />
            </div>
            <div className="flex items-center">
              <p className="flex-1 text-xs font-medium text-[#333333]">
                Wanna write lengthier posts? Write a{' '}
                <Link
                  href="/blog/create"
                  className="cursor-pointer text-violet-600 underline hover:text-violet-800"
                >
                  Blog
                </Link>{' '}
                instead.
              </p>
              <Button
                type="submit"
                disabled={(text === '' && postImage === null) || isOverLimit}
                className="flex items-center gap-x-1.5 rounded-full bg-sky-500 px-4 py-1.5 text-white shadow-sm transition-all duration-200 hover:bg-sky-600 active:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isLoading ? (
                  <span className="text-xs font-medium">Submitting...</span>
                ) : (
                  <>
                    <BsSend className="text-sm" />
                    <span className="text-xs font-medium">Post</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreatePost
