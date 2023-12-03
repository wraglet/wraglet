'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { UserInterface } from '../interfaces';
import AvatarMenu from './AvatarMenu';
import { HomeIcon, PeopleIcon, ChatIcon, BellIcon } from './NavIcons';
import { Quicksand } from 'next/font/google';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
});

const Header = ({ currentUser }: { currentUser: UserInterface }) => {
  return (
    <header className='h-[56px] z-10 fixed w-full bg-[#0EA5E9] px-2.5 lg:px-6 drop-shadow-md flex items-center justify-between gap-x-5 md:gap-x-8 lg:gap-x-10'>
      <div className='flex space-x-1.5 items-center h-full col-span-2'>
        <Link href='/feed' className='block'>
          <div className='relative h-10 w-10'>
            <Image src={'/images/logo/logo.png'} fill alt='Wraglet' />
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
        <AvatarMenu
          gender={currentUser.gender}
          firstName={currentUser.firstName}
        />
      </ul>
    </header>
  );
};

export default Header;
