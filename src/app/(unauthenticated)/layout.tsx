import type { Metadata } from 'next'

import UnauthenticatedLayoutClient from '@/components/UnauthenticatedLayoutClient'

export const metadata: Metadata = {
  title: {
    default: 'Wraglet',
    template: '%s | Wraglet'
  },
  description:
    'Read important information about Wraglet. Access our help center, terms of service, privacy policy, cookie policy, and advertising information.',
  openGraph: {
    title: 'Wraglet',
    description:
      'Read important information about Wraglet. Access our help center, terms of service, privacy policy, cookie policy, and advertising information.',
    images: [
      {
        url: 'https://cdn.wraglet.com/images/logo/logo.png',
        alt: 'Wraglet',
        type: 'image/png',
        width: 300,
        height: 300
      }
    ],
    siteName: 'Wraglet'
  },
  twitter: {
    title: 'Wraglet',
    description:
      'Read important information about Wraglet. Access our help center, terms of service, privacy policy, cookie policy, and advertising information.',
    images: [
      {
        url: 'https://cdn.wraglet.com/images/logo/logo.png',
        alt: 'Wraglet',
        type: 'image/png',
        width: 300,
        height: 300
      }
    ]
  }
}

const UnauthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return <UnauthenticatedLayoutClient>{children}</UnauthenticatedLayoutClient>
}

export default UnauthenticatedLayout
