'use client';
import Image from 'next/image';
import { HiOutlineUsers, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { useEffect, useState } from 'react';
import Input from './components/Input';
import Modal from './components/Modal';
import SignUp from './components/SignUp';
import Footer from './components/Footer';
import Button from './components/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const [isOpenSignUpModal, setIsOpenSignUpModal] = useState(false);

  useEffect(() => {
    if (session?.status === 'authenticated') {
      router.push('/users');
    }
  }, [router, session?.status]);

  return (
    <>
      <Modal
        onClose={() => setIsOpenSignUpModal(false)}
        isOpen={isOpenSignUpModal}
        title='Create an account'
      >
        <SignUp />
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
                <Button
                  type='submit'
                  className='rounded text-white bg-[#42BBFF] flex items-center justify-center text-xs w-full py-2'
                >
                  Login
                </Button>
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
        <Footer />
      </main>
    </>
  );
}
