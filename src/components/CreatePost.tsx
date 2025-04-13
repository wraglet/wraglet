'use client'

import { ChangeEvent, FormEvent, useReducer } from 'react'
import Image from 'next/image'
import useUserStore from '@/store/user'
import { BsSend } from 'react-icons/bs'
import { HiOutlinePlayCircle } from 'react-icons/hi2'

import Avatar from '@/components/Avatar'
import { GalleryIcon, TerminalIcon } from '@/components/Icons'
import { Button } from '@/components/ui/button'
import UploadPostImage from '@/components/UploadPostImage'

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
            <Avatar
              gender={user?.gender}
              alt={`${user?.firstName}'s photo`}
              src={user?.profilePicture?.url!}
            />
          </div>
          <form
            onSubmit={submitPost}
            className="flex grow flex-col justify-start gap-y-1.5"
          >
            <input
              type="text"
              value={text}
              className="h-[30px] w-full rounded-2xl border border-solid border-[#E5E5E5] bg-[#E7ECF0] px-2 text-sm text-[#333333] drop-shadow-md focus:outline-hidden"
              placeholder="Wanna share something up?"
              onChange={setText}
            />
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
                <span className="cursor-pointer text-violet-600">Blog</span>{' '}
                instead.
              </p>
              <Button
                type="submit"
                disabled={text === '' && postImage === null}
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
