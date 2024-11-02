'use client';

import Avatar from '@/components/Avatar';
import { setUser } from '@/libs/redux/features/userSlice';
import { useAppSelector } from '@/libs/redux/hooks';
import { RootState } from '@/libs/redux/store';
import axios from 'axios';
import Image from 'next/image';
import React, { FormEvent, useReducer } from 'react';
import { FaCamera, FaUserPen, FaPencil } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import UploadProfilePicture from './UploadProfilePicture';
import deJSONify from '@/utils/deJSONify';

const ProfileHeader = () => {
  const dispatch = useDispatch();
  const reducer = (state: any, action: any) => ({ ...state, ...action });
  const { user } = useAppSelector((state: RootState) => state.userState);

  const initialState = {
    openUploadProfilePictureModal: false,
    profilePicture: user?.profilePicture?.url,
    isLoading: false
  };

  const [
    { openUploadProfilePictureModal, profilePicture, isLoading },
    dispatchState
  ] = useReducer(reducer, initialState);

  const handleUpdateProfilePicture = async (
    e: FormEvent<HTMLFormElement>,
    profilePicture: string
  ) => {
    e.preventDefault();
    dispatchState({
      isLoading: true
    });

    try {
      const jsonUpdatedUser = await axios.patch('/api/update-profile-picture', {
        profilePicture
      });

      const updatedUser = deJSONify(jsonUpdatedUser.data);

      dispatch(setUser(updatedUser));
    } catch (error) {
      console.error(error);
    } finally {
      dispatchState({
        isLoading: false,
        openUploadProfilePictureModal: false
      });
    }
  };

  return (
    <>
      <UploadProfilePicture
        isLoading={isLoading}
        profilePicture={profilePicture}
        show={openUploadProfilePictureModal}
        close={() => dispatchState({ openUploadProfilePictureModal: false })}
        setProfilePicture={(profilePicture: string, e) =>
          handleUpdateProfilePicture(e, profilePicture)
        }
      />
      <section className='w-full xl:w-[1250px] flex flex-col items-center bg-white shadow-md h-auto lg:rounded-md mt-14'>
        <div className='block relative w-full h-[114px] md:h-[284px] lg:h-[360px]'>
          <div className='block group relative w-full h-[114px] md:h-[284px] lg:h-[360px]'>
            <Image
              fill
              src={
                user?.coverPhoto
                  ? user.coverPhoto.url
                  : '/images/placeholder/cover-photo-default.jpg'
              }
              alt={
                user?.coverPhoto
                  ? `${user.firstName}'s cover photo`
                  : `User's default cover photo`
              }
            />
            <div className='hidden group-hover:flex absolute right-2.5 bottom-2.5 bg-[#D9D9D9] rounded-full w-6 h-6 md:w-9 md:h-9 cursor-pointer items-center justify-center shadow-md'>
              <FaCamera className='text-black text-[8px] md:text-sm' />
            </div>
          </div>

          <div className='absolute overflow-hidden -bottom-[50px] md:-bottom-[80px] lg:-bottom-[90px] left-4 lg:left-16 z-10'>
            <div className='group block relative'>
              <Avatar
                src={user?.profilePicture?.url}
                gender={user?.gender}
                alt={`${user?.firstName}'s avatar`}
                size='shadow-md h-[100px] w-[100px] md:h-[160px] md:w-[160px]'
              />
              <div
                onClick={() =>
                  dispatchState({ openUploadProfilePictureModal: true })
                }
                className='hidden group-hover:flex absolute right-2.5 bottom-2.5 bg-[#D9D9D9] rounded-full w-6 h-6 md:w-9 md:h-9 cursor-pointer items-center justify-center shadow-md'
              >
                <FaCamera className='text-black text-[8px] md:text-sm' />
              </div>
            </div>
          </div>
        </div>
        <div className='h-[90px] md:h-[120px] lg:h-[140px] w-full flex flex-col relative justify-between'>
          <div className='ml-[132px] md:ml-[180px] lg:ml-[242px] flex justify-between items-center mt-1 md:mt-5 lg:mt-10 mr-4'>
            <div className='flex flex-col'>
              <h1 className='text-black font-semibold text-xl -tracking-[0.4px]'>
                {user?.firstName} {user?.lastName}
              </h1>
              <div className='flex items-center gap-x-2 text-[10px] font-semibold text-zinc-500 -tracking-[0.2px]'>
                <span>500 friends</span> <span>3k following</span>
              </div>
            </div>
            <span className='text-xl text-slate-700 self-end'>
              <FaUserPen />
            </span>
          </div>
          <div className='ml-[35px] md:ml-[180px] lg:ml-[242px] pb-4 md:pb-7 lg:pb-[30px]'>
            <div className='flex gap-x-4'>
              <p className='italic text-xs text-slate-700 font-medium'>
                &quot;{user?.bio ?? 'Set you bio here'}&quot;
              </p>
              <FaPencil className='text-slate-600' size={10} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileHeader;
