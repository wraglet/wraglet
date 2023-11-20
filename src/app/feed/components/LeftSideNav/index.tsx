import getCurrentUser from '@/app/actions/getCurrentUser';
import { BlogOutlineIcon } from '@/app/components/Icons';
import Image from 'next/image';
import React from 'react';
import VideoIcon from './icons/VideoIcon';
import Avatar from '@/app/components/Avatar';

const LeftSideNav = async () => {
  const currentUser = await getCurrentUser();
  return (
    <section className='h-auto border-r border-solid border-[#E5E5E5] col-span-2 flex flex-col'>
      <div className='flex-1 flex flex-col mt-4 gap-y-6'>
        <div className='group hover:bg-gray-400 px-3 h-[50px] w-full flex rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200 items-center cursor-pointer'>
          <div className='flex items-center space-x-2'>
            <Avatar
              className='group-hover:border-white'
              alt={`${currentUser?.firstName}'s Profile`}
              src={currentUser?.profilePicture}
            />
            <h2 className='group-hover:text-white text-xs font-semibold text-[#333333]'>
              {currentUser?.firstName}
            </h2>
          </div>
        </div>
        <div className='flex flex-col rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
          <div className='group hover:bg-gray-400 h-[50px] w-full rounded-[inherit]'>
            <div className='flex items-center px-3 space-x-2 w-full h-full'>
              <BlogOutlineIcon className='group-hover:text-white text-[#536471] h-7 w-auto' />
              <h2 className='text-xs group-hover:text-white font-semibold text-[#333333]'>
                Blog
              </h2>
            </div>
          </div>

          <div className='group hover:bg-gray-400 h-[50px] w-full rounded-[inherit]'>
            <div className='flex items-center px-3 w-full h-full'>
              <VideoIcon className='group-hover:text-white text-[#536471] h-7 w-auto' />
              <h2 className='text-xs group-hover:text-white font-semibold text-[#333333]'>
                Videos
              </h2>
            </div>
          </div>
        </div>
      </div>
      <footer className='text-sm font-semibold pl-3 pb-2'>
        &copy; {new Date().getFullYear()} Wraglet
      </footer>
    </section>
  );
};

export default LeftSideNav;
