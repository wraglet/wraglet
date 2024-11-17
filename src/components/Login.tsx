'use client'

import React, { FormEvent, useReducer } from 'react'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { HiOutlineChatBubbleLeftRight, HiOutlineUsers } from 'react-icons/hi2'

import Button from '@/components/Button'
import Footer from '@/components/Footer'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import SignUp from '@/components/SignUp'

const initialState = {
  email: '',
  password: '',
  isOpenSignUpModal: false,
  isLoading: false
}

const Login = () => {
  const { status } = useSession()
  const reducer = (state: any, action: any) => ({ ...state, ...action })
  const [{ email, password, isOpenSignUpModal, isLoading }, dispatchState] =
    useReducer(reducer, initialState)

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatchState({ isLoading: true })

    const formData = {
      email,
      password
    }

    signIn('credentials', {
      ...formData,
      redirect: false
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error('Invalid credentials')
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Logged in!')
        }
      })
      .finally(() => dispatchState({ isLoading: false }))
  }
  return (
    status === 'unauthenticated' && (
      <>
        <Modal
          onClose={() => dispatchState({ isOpenSignUpModal: false })}
          isOpen={isOpenSignUpModal}
          title="Create an account"
        >
          <SignUp />
        </Modal>
        <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden">
          <section className="grid w-full flex-grow grid-cols-2">
            <div className="relative col-span-1 block bg-[#42BBFF]">
              <div className="ml-44 flex h-full w-full flex-col justify-center gap-y-4 text-white">
                <div className="flex items-center gap-5">
                  <HiOutlineChatBubbleLeftRight />
                  <h2 className="text-base font-medium">Join conversation.</h2>
                </div>
                <div className="flex items-center gap-5">
                  <HiOutlineUsers />
                  <h2 className="text-base font-medium">Make new friends.</h2>
                </div>
              </div>
              <div className="absolute bottom-[-244px] right-[-65px] -z-0">
                <div className="relative">
                  <div className="block h-[535px] w-[552px]">
                    <Image
                      priority
                      src={'/images/logo/logo.png'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      width={1}
                      height={1}
                      fill
                      style={{ height: '100%', width: '100%' }}
                      alt="Wraglet logo"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative col-span-1 block">
              <div className="flex h-full w-full items-center justify-center">
                <form
                  onSubmit={handleLogin}
                  className="flex flex-col gap-7 px-10 py-7 shadow-md"
                >
                  <Input
                    value={email}
                    onChange={(e) => dispatchState({ email: e.target.value })}
                    placeholder="Email"
                    type="email"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <Input
                      value={password}
                      onChange={(e) =>
                        dispatchState({ password: e.target.value })
                      }
                      type="password"
                      placeholder="Pasword"
                      autoComplete="false"
                    />

                    <h4 className="ml-1 cursor-pointer text-xs font-medium text-[#1B87EA]">
                      Forgot Password?
                    </h4>
                  </div>
                  <Button
                    type="submit"
                    className="flex w-full items-center justify-center rounded bg-[#42BBFF] py-2 text-xs text-white"
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <p className="text-xs font-medium text-black">
                    Don&apos;t have an account?{' '}
                    <button
                      className="cursor-pointer text-[#1B87EA]"
                      onClick={() => dispatchState({ isOpenSignUpModal: true })}
                    >
                      Sign up!
                    </button>
                  </p>
                </form>
              </div>
              <div className="absolute bottom-0 left-0 h-[150px] w-[65px] bg-white" />
            </div>
          </section>
          <Footer />
        </main>
      </>
    )
  )
}

export default Login
