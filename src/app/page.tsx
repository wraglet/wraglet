'use client';
import Image from 'next/image';
import { HiOutlineUsers, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { MouseEvent, useState } from 'react';
import Input from './components/Input';
import Modal from './components/Modal';
import BirthdayPicker from './components/BirthdayPicker';

export default function Home() {
  const [isOpenSignUpModal, setIsOpenSignUpModal] = useState(true);

  const [publicProfile, setPublicProfile] = useState(true);
  const [friendRequests, setFriendRequests] = useState('everyone');

  const handleFriendRequestsChange = (value: string) => {
    setFriendRequests(value);
  };

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleAgreeToTermsChange = () => {
    setAgreeToTerms(!agreeToTerms);
  };

  const handleSignUp = (e: MouseEvent<HTMLSpanElement>) => {};
  return (
    <>
      <Modal
        onClose={() => setIsOpenSignUpModal(false)}
        isOpen={isOpenSignUpModal}
        title='Create an account'
      >
        <div className='flex flex-col gap-y-4'>
          <div className='flex space-x-2'>
            <Input placeholder='First name' type='text' />
            <Input placeholder='Last name' type='text' />
          </div>
          <Input placeholder='Email' type='email' />
          <Input placeholder='Password' type='password' />
          <BirthdayPicker />
          <div className='flex items-center'>
            <div className='flex flex-col flex-1 items-start'>
              <h3 className='pl-1 text-sm mb-2 text-slate-600'>
                Privacy Settings
              </h3>
              <div className='pl-1 mb-1'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={publicProfile}
                    onChange={() => setPublicProfile(!publicProfile)}
                  />
                  <span className='text-sm text-slate-600'>Public Profile</span>
                </label>
              </div>
            </div>
            <div className='flex flex-col flex-1'>
              <label className='block text-sm text-slate-600 mb-1'>
                Friend Requests
              </label>
              <select
                className='w-full h-8 border border-solid border-slate-200 rounded px-2 text-sm'
                value={friendRequests}
                onChange={(e) => handleFriendRequestsChange(e.target.value)}
              >
                <option value='everyone'>Everyone</option>
                <option value='friendsOfFriends'>Friends of Friends</option>
                <option value='noOne'>No One</option>
              </select>
            </div>
          </div>
          <div className='flex flex-col'>
            <h3 className='mb-0.5 pl-1 text-sm text-slate-600'>
              Terms of Service and Privacy Policy
            </h3>
            <div className='mb-2'>
              <label className='flex items-center space-x-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={agreeToTerms}
                  onChange={handleAgreeToTermsChange}
                />
                <span className='text-sm text-slate-600'>
                  I agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
      <main className='flex min-h-screen flex-col items-center justify-between overflow-hidden'>
        <section className='flex-grow grid grid-cols-2 w-full'>
          <div className='bg-[#42BBFF] col-span-1 relative block'>
            <div className='w-full h-full flex flex-col justify-center ml-44 text-white gap-y-4'>
              <div className='flex gap-5 items-center'>
                <HiOutlineChatBubbleLeftRight />
                <h2 className='font-medium text-base'>Join conversation.</h2>
              </div>
              <div className='flex gap-5 items-center'>
                <HiOutlineUsers />
                <h2 className='font-medium text-base'>Make new friends.</h2>
              </div>
            </div>
            <div className='absolute right-[-65px] bottom-[-244px] -z-0'>
              <div className='relative'>
                <div className='block w-[552px] h-[535px]'>
                  <Image
                    priority
                    src={'/images/logo/logo.png'}
                    fill
                    alt='Wraglet logo'
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='block col-span-1 relative'>
            <div className='flex w-full h-full items-center justify-center'>
              <form className='flex flex-col gap-7 shadow-md px-10 py-7'>
                <Input placeholder='Email' type='email' autoFocus />
                <div className='flex flex-col gap-1'>
                  <Input
                    type='password'
                    placeholder='Pasword'
                    autoComplete='false'
                  />

                  <h4 className='ml-1 font-medium text-xs text-[#1B87EA] cursor-pointer'>
                    Forgot Password?
                  </h4>
                </div>
                <button
                  type='submit'
                  className='rounded text-white bg-[#42BBFF] flex items-center justify-center text-xs w-full py-2'
                >
                  Login
                </button>
                <p className='text-xs font-medium text-black'>
                  Don&apos;t have an account?{' '}
                  <span
                    className='text-[#1B87EA] cursor-pointer'
                    onClick={() => setIsOpenSignUpModal(true)}
                  >
                    Sign up!
                  </span>
                </p>
              </form>
            </div>
            <div className='absolute w-[65px] h-[150px] left-0 bottom-0 bg-white' />
          </div>
        </section>
        <footer className='h-[50px] w-full flex items-center justify-center gap-[50px] text-xs font-medium z-20 bg-white'>
          <h3>About</h3>
          <h3>Help</h3>
          <h3>Terms of Service</h3>
          <h3>Privacy Policy</h3>
          <h3>Cookie Policy</h3>
          <h3>Advertising</h3>
          <h3>&copy; {new Date().getFullYear()} Wraglet</h3>
        </footer>
      </main>
    </>
  );
}
