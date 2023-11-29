'use client';

import Avatar from '@/app/components/Avatar';
import Button from '@/app/components/Button';
import { ShareIcon } from '@/app/components/Icons';
import { PostInterface } from '@/app/interfaces';
import arrGenerator from '@/app/utils/arrGenerator';
import { formatDistanceToNow } from 'date-fns';
import { Nunito_Sans } from 'next/font/google';
import React from 'react';
import { FaRegComment, FaRegHeart } from 'react-icons/fa6';
import { LuArrowBigUp, LuArrowBigDown } from 'react-icons/lu';

const nunito_sans = Nunito_Sans({ subsets: ['latin'] });
type Props = {
  post: PostInterface;
};

const Post = ({ post }: Props) => {
  return (
    <div className='flex w-full'>
      <div className='rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200 flex px-4 py-3 gap-x-2 w-full items-start justify-between'>
        <Avatar />
        <div className='flex flex-col gap-y-5 flex-grow justify-start'>
          <div className='flex flex-col gap-y-1'>
            <div className='flex space-x-1 items-baseline'>
              <h3
                className={`text-sm font-bold leading-none ${nunito_sans.className}`}
              >
                {post.author.firstName} {post.author.lastName}
              </h3>
              <svg
                className='self-center'
                width='2'
                height='3'
                viewBox='0 0 2 3'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='1' cy='1.85547' r='1' fill='#4B5563' />
              </svg>
              {post.createdAt && (
                <h4 className='text-xs text-zinc-500'>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true
                  })}
                </h4>
              )}
            </div>
            <p className='text-gray-600 text-xs'>{post.content}</p>
          </div>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-1 border border-solid border-gray-400 rounded-full px-2 py-0.5'>
              <LuArrowBigUp className='text-xs text-gray-600' />
              <span className='text-xs text-gray-600'>12</span>
              <LuArrowBigDown className='text-xs text-gray-600' />
            </div>
            <div className='flex items-center gap-1 border border-solid border-gray-400 rounded-full px-2 py-0.5'>
              <FaRegComment className='text-xs text-gray-600' />
            </div>
            <div className='flex items-center gap-1 border border-solid border-gray-400 rounded-full px-2 py-0.5'>
              <FaRegHeart className='text-xs text-gray-600' />
            </div>
            <div className='flex items-center gap-1 border border-solid border-gray-400 rounded-full px-2 py-0.5'>
              <ShareIcon className='text-xs text-gray-600' />
            </div>
          </div>
        </div>
        <Button className='flex gap-0.5 items-center'>
          {arrGenerator(3).map((i) => (
            <span className='h-0.5 w-0.5 bg-gray-700 rounded-full' key={i} />
          ))}
        </Button>
      </div>
    </div>
  );
};

export default Post;
