'use client'

import React, { useState } from 'react'

import LoginForm from '@/components/LoginForm'
import SignUp from '@/components/SignUp'

const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="mb-1 flex w-full flex-col items-center gap-2">
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
      <div className="mt-1 flex w-full justify-center">
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
