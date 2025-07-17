import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import getSession from '@/actions/getSession'

import LoginForm from '@/components/auth/LoginForm'

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
    redirect('/feed')
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="mb-1 flex w-full flex-col items-center gap-2">
        <h1 className="font-geist-sans text-center text-2xl font-semibold text-[#0EA5E9]">
          Welcome Back!
        </h1>
        <p className="font-geist-sans text-center text-sm text-neutral-500">
          Sign in to continue to Wraglet
        </p>
      </div>
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
