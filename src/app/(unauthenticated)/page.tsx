import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getSession from '@/actions/getSession'
import { signOut } from '@/auth'
import { canUserSignIn, needsEmailVerification } from '@/lib/auth/accountAccess'

import LoginForm from '@/components/auth/LoginForm'
import LoginVerifiedBanner from '@/components/auth/LoginVerifiedBanner'

export const metadata: Metadata = {
  title: 'Sign In to Wraglet',
  description:
    'Sign in to your Wraglet account to connect with writers, share your stories, and engage with the creative community. Join thousands of writers sharing their craft.',
  keywords: [
    'Wraglet login',
    'sign in',
    'writer login',
    'creative community',
    'writing platform',
    'story sharing'
  ],
  openGraph: {
    title: 'Sign In to Wraglet',
    description:
      'Sign in to your Wraglet account to connect with writers, share your stories, and engage with the creative community.',
    images: [
      {
        url: 'https://cdn.wraglet.com/images/logo/logo.png',
        alt: 'Wraglet - Creative Writing Community',
        type: 'image/png',
        width: 300,
        height: 300
      }
    ],
    siteName: 'Wraglet',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Sign In to Wraglet',
    description:
      'Sign in to your Wraglet account to connect with writers, share your stories, and engage with the creative community.',
    images: [
      {
        url: 'https://cdn.wraglet.com/images/logo/logo.png',
        alt: 'Wraglet - Creative Writing Community'
      }
    ]
  },
  alternates: {
    canonical: 'https://wraglet.com'
  },
  robots: {
    index: true,
    follow: true
  }
}

const LoginPage = async () => {
  const session = await getSession()

  if (session?.user) {
    const currentUser = await getCurrentUser()
    if (currentUser && canUserSignIn(currentUser)) {
      redirect('/feed')
    }
    if (currentUser && needsEmailVerification(currentUser)) {
      await signOut({
        redirectTo: `/verify-email?email=${encodeURIComponent(currentUser.email)}`
      })
    }
    if (session.user) {
      await signOut({ redirectTo: '/?error=account_suspended' })
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="mb-1 flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-semibold text-[#0EA5E9]">
          Welcome Back!
        </h1>
        <p className="text-center text-sm text-neutral-500">
          Sign in to continue to Wraglet
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginVerifiedBanner />
      </Suspense>
      <LoginForm />
      <div className="mt-1 flex w-full justify-center">
        <Link
          href="/register"
          className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
        >
          Don&apos;t have an account?{' '}
          <span className="font-semibold">Sign up!</span>
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
