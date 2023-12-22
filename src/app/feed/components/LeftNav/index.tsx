'use client';

import { BlogOutlineIcon } from '@/components/Icons';
import { useEffect, useRef, useState } from 'react';
import VideoIcon from './icons/VideoIcon';
import Avatar from '@/components/Avatar';
import { useDimensions } from '@/utils/useDimension';
import { useAppSelector } from '@/libs/redux/hooks';
import { RootState } from '@/libs/redux/store';
import Link from 'next/link';

const LeftSideNav = () => {
  const { user } = useAppSelector((state: RootState) => state.userState);
  const [hydrated, setHydrated] = useState(false);

  const ref = useRef(null);

  const { width, left, right } = useDimensions(ref);

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true);
  }, []);
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  return (
    <section
      ref={ref}
      className='hidden lg:block xl:w-[360px] lg:w-[280px] relative h-[calc(100vh-56px)]'
    >
      <div
        className={`bottom-0 3xl:left-auto fixed top-14 overflow-y-auto lg:left-0  flex flex-col h-[calc(100vh-56px)] ml-4 3xl:ml-auto 2xl:w-[360px] lg:w-[280px]`}
      >
        <div className='flex-1 flex flex-col mt-4 gap-y-6'>
          <Link
            href={`/profile/${user?.username}`}
            className='group hover:bg-gray-400 px-3 h-[50px] w-full flex rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200 items-center cursor-pointer'
          >
            <div className='flex items-center space-x-2'>
              <Avatar
                gender={user?.gender}
                className='group-hover:border-white'
                alt={`${user?.firstName}'s Profile`}
                src={user?.profilePicture?.url}
              />
              <h2 className='group-hover:text-white text-xs font-semibold text-[#333333]'>
                {user?.firstName}
              </h2>
            </div>
          </Link>
          <div className='flex flex-col rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200'>
            <div className='group hover:bg-gray-400 h-[50px] w-full rounded-[inherit]'>
              <div className='flex items-center px-3 space-x-2 w-full h-full'>
                <BlogOutlineIcon className='group-hover:text-white text-[#536471] h-7 w-7' />
                <h2 className='text-xs group-hover:text-white font-semibold text-[#333333]'>
                  Blog
                </h2>
              </div>
            </div>

            <div className='group hover:bg-gray-400 h-[50px] w-full rounded-[inherit]'>
              <div className='flex items-center px-3 space-x-2 w-full h-full'>
                <VideoIcon className='group-hover:text-white text-[#536471] h-7 w-7' />
                <h2 className='text-xs group-hover:text-white font-semibold text-[#333333]'>
                  Videos
                </h2>
              </div>
            </div>
          </div>
        </div>
        <footer className='mt-4 text-xs font-semibold pl-3 pb-2 text-[#0EA5E9]'>
          &copy; {new Date().getFullYear()} Wraglet
        </footer>
      </div>
    </section>
  );
};

export default LeftSideNav;
