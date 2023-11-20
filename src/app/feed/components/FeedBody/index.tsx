import Avatar from '@/app/components/Avatar';
import { GalleryIcon, ShareIcon, TerminalIcon } from '@/app/components/Icons';
import React from 'react';
import { HiOutlinePlayCircle } from 'react-icons/hi2';
import { BsSend } from 'react-icons/bs';
import Button from '@/app/components/Button';
import getCurrentUser from '@/app/actions/getCurrentUser';
import arrGenerator from '@/app/utils/arrGenerator';
import { LuArrowBigUp, LuArrowBigDown } from 'react-icons/lu';
import { FaRegComment } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa6';

const FeedBody = async () => {
  const currentUser = await getCurrentUser();
  return (
    <section className='col-span-5 h-auto flex flex-col mt-6 w-full gap-y-4'>
      <div className='flex w-full items-start rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
        <div className='flex px-4 py-3 gap-x-2 w-full'>
          <Avatar />
          <form className='flex flex-col gap-y-1.5 flex-grow justify-start'>
            <input
              type='text'
              className='w-full bg-[#E7ECF0] h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333] drop-shadow-md'
              placeholder='Wanna share something up?'
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
                <BsSend className='text-base text-white' />
                <h4 className='text-white text-xs font-medium'>Post</h4>
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Start of Feed Post */}
      <div className='flex w-full items-start rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
        <div className='flex px-4 py-3 gap-x-2 w-full items-start justify-between'>
          <Avatar />
          <div className='flex flex-col gap-y-5 flex-grow justify-start'>
            <div className='flex flex-col gap-y-1'>
              <div className='flex space-x-1 items-baseline'>
                <h3 className='text-base font-bold leading-none'>
                  {currentUser?.firstName} {currentUser?.lastName}
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
                <h4 className='text-xs text-zinc-500'>3 hr. ago </h4>
              </div>
              <p className='text-gray-600 text-xs'>
                Lorem ipsum, dolor sit amet conse. Saepe optio minus rem dolor
                sit amet!
              </p>
            </div>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-1 border border-solid border-gray-40 rounded-full px-2 py-0.5'>
                <LuArrowBigUp className='text-xs text-gray-600' />
                <span className='text-xs text-gray-600'>12</span>
                <LuArrowBigDown className='text-xs text-gray-600' />
              </div>
              <div className='flex items-center gap-1 border border-solid border-gray-40 rounded-full px-2 py-0.5'>
                <FaRegComment className='text-xs text-gray-600' />
              </div>
              <div className='flex items-center gap-1 border border-solid border-gray-40 rounded-full px-2 py-0.5'>
                <FaRegHeart className='text-xs text-gray-600' />
              </div>
              <div className='flex items-center gap-1 border border-solid border-gray-40 rounded-full px-2 py-0.5'>
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
    </section>
  );
};

export default FeedBody;
