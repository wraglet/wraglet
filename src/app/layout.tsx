import type { Metadata } from 'next'
import localFont from 'next/font/local'

import '@/app/globals.css'

import ToasterContext from '@/context/ToasterContext'
import Providers from '@/providers'
import { AblyProvider } from '@/providers/AblyProvider'

export const dynamic = 'force-dynamic'

const geistSans = localFont({
  src: './../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

const title = 'Wraglet'

export const metadata: Metadata = {
  title: title,
  description:
    "Wraglet is more than a social platform; it's a movement towards profound connections. Embrace a future where impactful brevity takes center stage, and every voice resonates. Join Wraglet today and be part of the evolution of meaningful online interaction.",
  twitter: {
    images: {
      url: 'https://pub-c5365d46e2924ca2be4f4198d5b3d377.r2.dev/images/logo/logo.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 300,
      height: 300
    }
  },
  openGraph: {
    title: title,
    images: {
      url: 'https://pub-c5365d46e2924ca2be4f4198d5b3d377.r2.dev/images/logo/logo.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 300,
      height: 300
    },
    siteName: title,
    description:
      'Discover Wraglet, where concise expression meets impactful connection. Redefining social media, Wraglet fosters meaningful interactions with a focus on brevity and resonance. Join us for a future where every voice matters.'
  }
}

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AblyProvider>
          <Providers>
            <ToasterContext />
            {children}
          </Providers>
        </AblyProvider>
      </body>
    </html>
  )
}

export default Layout
