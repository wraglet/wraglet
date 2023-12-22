'use client';

import UploadPostImage from '@/app/profile/[username]/components/UploadPostImage';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import { GalleryIcon, TerminalIcon } from '@/components/Icons';
import { useAppSelector } from '@/libs/redux/hooks';
import { RootState } from '@/libs/redux/store';
import Image from 'next/image';
import React, { ChangeEvent, FormEvent, useReducer } from 'react';
import { BsSend } from 'react-icons/bs';
import { HiOutlinePlayCircle } from 'react-icons/hi2';

type Props = {
  submitPost: (e: FormEvent) => Promise<void>;
  isLoading: boolean;
  setText: (e: ChangeEvent<HTMLInputElement>) => void;
  setPostImage: (postImage: string) => void;
  text: string;
  postImage: string;
};

const CreatePost = ({
  submitPost,
  isLoading,
  setText,
  text,
  postImage,
  setPostImage
}: Props) => {
  const { user } = useAppSelector((state: RootState) => state.userState);

  const reducer = (state: any, action: any) => ({ ...state, ...action });

  const initialState = {
    openUploadModal: false
  };

  const [{ openUploadModal }, dispatchState] = useReducer(
    reducer,
    initialState
  );

  return (
    <>
      <UploadPostImage
        postImage={postImage}
        show={openUploadModal}
        close={() => dispatchState({ openUploadModal: false })}
        setPostImage={setPostImage}
      />
      <div className='flex flex-grow w-full items-start sm:rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
        <div className='flex px-4 py-3 gap-x-2 w-full'>
          <div className='block relative'>
            <Avatar
              gender={user?.gender}
              alt={`${user?.firstName}'s photo`}
              src={user?.profilePicture?.url}
            />
          </div>
          <form
            onSubmit={submitPost}
            className='flex flex-col gap-y-1.5 flex-grow justify-start'
          >
            <input
              type='text'
              value={text}
              className='w-full bg-[#E7ECF0] h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333] drop-shadow-md'
              placeholder='Wanna share something up?'
              onChange={setText}
            />
            {postImage && (
              <div className='block rounded-md overflow-hidden my-3'>
                <Image
                  src={postImage}
                  alt='Post Image'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  width={1}
                  height={1}
                  style={{
                    height: 'auto',
                    width: '100%'
                  }}
                />
              </div>
            )}
            <div className='flex items-center gap-x-1'>
              <HiOutlinePlayCircle className='h-6 w-6 text-sky-500' />
              <GalleryIcon
                className='h-6 w-auto text-sky-500 cursor-pointer'
                onClick={() => dispatchState({ openUploadModal: true })}
              />
              <TerminalIcon className='h-6 w-auto text-sky-500' />
            </div>
            <div className='flex items-center'>
              <p className='flex-1 font-medium text-xs text-[#333333]'>
                Wanna write lengthier posts? Write a{' '}
                <span className='text-violet-600 cursor-pointer'>Blog</span>{' '}
                instead.
              </p>
              <Button
                type='submit'
                disabled={text === '' && postImage === null}
                className='rounded-lg drop-shadow-md flex items-center justify-center gap-1 bg-sky-500 px-2 py-1 disabled:bg-gray-500'
              >
                {isLoading ? (
                  <span className='text-white text-xs font-medium'>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <BsSend className='text-base text-white' />
                    <h4 className='text-white text-xs font-medium'>Post</h4>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
