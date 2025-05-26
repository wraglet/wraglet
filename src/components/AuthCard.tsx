'use client'

import React, { useState } from 'react'

import LoginForm from '@/components/LoginForm'
import SignUp from '@/components/SignUp'

const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="animate-fade-in-up mx-2 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-white/40 bg-white/70 px-4 py-8 shadow-2xl backdrop-blur-xl sm:px-6 sm:py-10">
      <div className="mb-2 flex w-full flex-col items-center gap-2">
        <h1 className="font-geist-sans text-center text-2xl font-semibold text-[#0EA5E9]">
          {mode === 'login' ? 'Welcome Back!' : 'Create an account'}
        </h1>
        <p className="font-geist-sans text-center text-sm text-neutral-500">
          {mode === 'login'
            ? 'Sign in to continue to Wraglet'
            : 'Sign up to join Wraglet'}
        </p>
      </div>
      {mode === 'login' ? <LoginForm /> : <SignUp />}
      <div className="mt-2 flex w-full justify-center">
        {mode === 'login' ? (
          <button
            type="button"
            className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
            onClick={() => setMode('signup')}
          >
            Don&apos;t have an account?{' '}
            <span className="font-semibold">Sign up!</span>
          </button>
        ) : (
          <button
            type="button"
            className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
            onClick={() => setMode('login')}
          >
            Already have an account?{' '}
            <span className="font-semibold">Log in!</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AuthCard
