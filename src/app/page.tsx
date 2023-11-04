'use client';
import Image from 'next/image';
import { HiOutlineUsers, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { MouseEvent } from 'react';

export default function Home() {
  const handleSignUp = (e: MouseEvent<HTMLSpanElement>) => {};
  return (
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
              <input
                type='email'
                className='h-8 w-fit border border-solid border-[#89AAFF] rounded py-1.5 px-4 text-xs'
                placeholder='Email'
                autoComplete='false'
                autoFocus
              />
              <div className='flex flex-col gap-1'>
                <input
                  type='password'
                  className='h-8 w-fit border border-solid border-[#89AAFF] rounded py-1.5 px-4 text-xs'
                  placeholder='Pasword'
                  autoComplete='false'
                />
                <h4 className='ml-1 font-medium text-xs text-[#1B87EA]'>
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
                <span className='text-[#1B87EA]' onClick={() => handleSignUp}>
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
  );
}
