'use client';

import Avatar from '@/app/components/Avatar';
import Button from '@/app/components/Button';
import { GalleryIcon, TerminalIcon } from '@/app/components/Icons';
import axios from 'axios';
import React, { FormEvent, useReducer } from 'react';
import toast from 'react-hot-toast';
import { BsSend } from 'react-icons/bs';
import { HiOutlinePlayCircle } from 'react-icons/hi2';

type Props = {
  currentUser: any;
};

const initialState = {
  content: '',
  isLoading: false
};

const CreatePost = ({ currentUser }: Props) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action });

  const [{ content, isLoading }, dispatch] = useReducer(reducer, initialState);

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ isLoading: true });

    axios
      .post('/api/posts', {
        content
      })
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => dispatch({ isLoading: false }));
  };
  return (
    <div className='flex w-full items-start rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
      <div className='flex px-4 py-3 gap-x-2 w-full'>
        <Avatar />
        <form
          onSubmit={handleCreatePost}
          className='flex flex-col gap-y-1.5 flex-grow justify-start'
        >
          <input
            type='text'
            value={content}
            className='w-full bg-[#E7ECF0] h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333] drop-shadow-md'
            placeholder='Wanna share something up?'
            onChange={(e) => dispatch({ content: e.target.value })}
          />
          <div className='flex items-center gap-x-1'>
            <HiOutlinePlayCircle className='h-6 w-6 text-sky-500' />
            <GalleryIcon className='h-6 w-auto text-sky-500' />
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
              className='rounded-lg drop-shadow-md flex items-center justify-center gap-1 bg-sky-500 px-2 py-1'
            >
              {isLoading ? (
                'Submitting... '
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
  );
};

export default CreatePost;
