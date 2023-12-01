'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { UserInterface } from '../interfaces';
import AvatarMenu from './AvatarMenu';
import { HomeIcon, PeopleIcon, ChatIcon, BellIcon } from './NavIcons';

const Header = ({ currentUser }: { currentUser: UserInterface }) => {
  return (
    <header className='h-[56px] z-10 fixed w-full bg-[#0EA5E9] px-6 items-center drop-shadow-md grid grid-cols-10 gap-x-10'>
      <div className='flex space-x-1.5 items-center h-full col-span-2'>
        <Link href='/' className='block'>
          <div className='relative h-10 w-10'>
            <Image src={'/images/logo/logo.png'} fill alt='Wraglet' />
          </div>
        </Link>
        <Link href={'/'} className={`text-xl font-bold text-white`}>
          wraglet
        </Link>
      </div>
      <div className='col-start-4 col-span-3 h-full flex items-center'>
        <input
          type='search'
          className='bg-[#E7ECF0] w-full h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333]'
        />
      </div>
      <ul className='col-end-11 col-span-2 flex justify-between items-center'>
        <li className='cursor-pointer'>
          <HomeIcon className='text-white' />
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
        <AvatarMenu firstName={currentUser.firstName} />
      </ul>
    </header>
  );
};

export default Header;
