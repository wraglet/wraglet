import React from 'react';
import { HomeIcon, PeopleIcon, ChatIcon, BellIcon } from './NavIcons';
import getCurrentUser from '../actions/getCurrentUser';
import AvatarMenu from './AvatarMenu';

const HeaderRightNav = async () => {
  const currentUser = await getCurrentUser();
  console.log('currentUser: ', currentUser);
  return (
    <ul className='col-end-11 col-span-2 flex justify-between items-center'>
      <li className='cursor-pointer'>
        <HomeIcon />
      </li>
      <li className='cursor-pointer'>
        <PeopleIcon />
      </li>
      <li className='cursor-pointer'>
        <ChatIcon />
      </li>
      <li className='cursor-pointer'>
        <BellIcon />
      </li>
      <AvatarMenu firstName={currentUser?.firstName} />
    </ul>
  );
};

export default HeaderRightNav;
