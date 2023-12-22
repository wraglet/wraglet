'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import Image from 'next/image';
import AvatarMenu from './AvatarMenu';
import { HomeIcon, PeopleIcon, ChatIcon, BellIcon } from './NavIcons';
import { Quicksand } from 'next/font/google';
import { setUser } from '@/libs/redux/features/userSlice';
import { UserDocument } from '@/models/User';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/libs/redux/store';
import {
  setJustLoggedIn,
  setUserSliceInitialized
} from '@/libs/redux/features/globalSlice';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
});

type Props = {
  currentUser: UserDocument;
};

const Header = ({ currentUser }: Props) => {
  // Initialize the store with the product information
  const dispatch = useDispatch();
  const { justLoggedIn, userSliceInitialized } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    if (!justLoggedIn && !userSliceInitialized) {
      dispatch(setJustLoggedIn(true));
    }

    if (justLoggedIn && !userSliceInitialized) {
      dispatch(setUser(currentUser));
      dispatch(setUserSliceInitialized(true));
      dispatch(setJustLoggedIn(false));
    }
  }, [currentUser, dispatch, justLoggedIn, userSliceInitialized]);

  return (
    <header className='h-[56px] z-50 fixed w-full bg-[#0EA5E9] px-2.5 lg:px-6 drop-shadow-md flex items-center justify-between gap-x-5 md:gap-x-8 lg:gap-x-10'>
      <div className='flex space-x-1.5 items-center h-full col-span-2'>
        <Link href='/feed' className='block'>
          <div className='relative h-10 w-10'>
            <Image
              src={'/favicon-32x32.png'}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              alt='Wraglet'
            />
          </div>
        </Link>
        <Link
          href={'/feed'}
          className={`${quicksand.className} text-xl font-bold text-white hidden md:block`}
        >
          wraglet
        </Link>
      </div>
      <div className='h-full flex w-full lg:w-[600px] items-center'>
        <input
          type='search'
          className='bg-[#E7ECF0] w-full h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333]'
        />
      </div>
      <ul className='flex justify-between gap-x-4 lg:gap-x-6 items-center'>
        <li className='cursor-pointer hidden md:block'>
          <Link href={'/feed'}>
            <HomeIcon className='text-white' />
          </Link>
        </li>
        <li className='cursor-pointer'>
          <PeopleIcon className='text-white' />
        </li>
        <li className='cursor-pointer'>
          <ChatIcon className='text-white' />
        </li>
        <li className='cursor-pointer'>
          <BellIcon className='text-white' />
        </li>
        <AvatarMenu />
      </ul>
    </header>
  );
};

export default Header;
