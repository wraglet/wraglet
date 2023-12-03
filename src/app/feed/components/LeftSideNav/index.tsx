'use client';

import { BlogOutlineIcon } from '@/app/components/Icons';
import { useEffect, useRef, useState } from 'react';
import VideoIcon from './icons/VideoIcon';
import Avatar from '@/app/components/Avatar';
import { UserInterface } from '@/app/interfaces';
import { useDimensions } from '@/app/utils/useDimension';

const LeftSideNav = ({ currentUser }: { currentUser: UserInterface }) => {
  const [hydrated, setHydrated] = useState(false);

  const ref = useRef(null);

  const { width } = useDimensions(ref);

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
      className='hidden lg:block col-start-1 col-span-2 relative'
    >
      <div
        className='fixed flex flex-col max-h-screen h-[calc(100vh-56px)]'
        style={{ width: `${width}px` }}
      >
        <div className='flex-1 flex flex-col mt-4 gap-y-6'>
          <div className='group hover:bg-gray-400 px-3 h-[50px] w-full flex rounded-lg drop-shadow-md bg-white border border-solid border-neutral-200 items-center cursor-pointer'>
            <div className='flex items-center space-x-2'>
              <Avatar
                className='group-hover:border-white'
                alt={`${currentUser.firstName}'s Profile`}
                src={currentUser.profilePicture}
              />
              <h2 className='group-hover:text-white text-xs font-semibold text-[#333333]'>
                {currentUser?.firstName}
              </h2>
            </div>
          </div>
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
        <footer className='text-xs font-semibold pl-3 pb-2 text-[#0EA5E9]'>
          &copy; {new Date().getFullYear()} Wraglet
        </footer>
      </div>
    </section>
  );
};

export default LeftSideNav;
