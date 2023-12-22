'use client';

import React, { FormEvent, useReducer } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineUsers } from 'react-icons/hi2';
import Button from './Button';
import Footer from './Footer';
import Modal from './Modal';
import SignUp from './SignUp';
import Input from './Input';
import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const initialState = {
  email: '',
  password: '',
  isOpenSignUpModal: false,
  isLoading: false
};

const Login = () => {
  const { status } = useSession();
  const reducer = (state: any, action: any) => ({ ...state, ...action });
  const [{ email, password, isOpenSignUpModal, isLoading }, dispatchState] =
    useReducer(reducer, initialState);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchState({ isLoading: true });

    const formData = {
      email,
      password
    };

    signIn('credentials', {
      ...formData,
      redirect: false
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid credentials');
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Logged in!');
        }
      })
      .finally(() => dispatchState({ isLoading: false }));
  };
  return (
    status === 'unauthenticated' && (
      <>
        <Modal
          onClose={() => dispatchState({ isOpenSignUpModal: false })}
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
                <form
                  onSubmit={handleLogin}
                  className='flex flex-col gap-7 shadow-md px-10 py-7'
                >
                  <Input
                    value={email}
                    onChange={(e) => dispatchState({ email: e.target.value })}
                    placeholder='Email'
                    type='email'
                    autoFocus
                  />
                  <div className='flex flex-col gap-1'>
                    <Input
                      value={password}
                      onChange={(e) =>
                        dispatchState({ password: e.target.value })
                      }
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
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <p className='text-xs font-medium text-black'>
                    Don&apos;t have an account?{' '}
                    <span
                      className='text-[#1B87EA] cursor-pointer'
                      onClick={() => dispatchState({ isOpenSignUpModal: true })}
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
    )
  );
};

export default Login;
