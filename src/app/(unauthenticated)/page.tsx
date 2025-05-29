import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import getSession from '@/actions/getSession'

import AuthCard from '@/components/AuthCard'

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

const AuthenticationPage = async () => {
  const session = await getSession()

  if (session?.user) {
    redirect('/feed')
  }

  return <AuthCard />
}

export default AuthenticationPage
