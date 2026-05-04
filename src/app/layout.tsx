import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@/app/globals.css'

import ToasterContext from '@/context/ToasterContext'
import Providers from '@/providers'

export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
})

const title = 'Wraglet'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.wraglet.com'),
  title: title,
  description:
    "Wraglet is more than a social platform; it's a movement towards profound connections. Embrace a future where impactful brevity takes center stage, and every voice resonates. Join Wraglet today and be part of the evolution of meaningful online interaction.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  twitter: {
    images: {
      url: '/android-chrome-512x512.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 512,
      height: 512
    }
  },
  openGraph: {
    title: title,
    images: {
      url: '/android-chrome-512x512.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 512,
      height: 512
    },
    siteName: title,
    description:
      'Discover Wraglet, where concise expression meets impactful connection. Redefining social media, Wraglet fosters meaningful interactions with a focus on brevity and resonance. Join us for a future where every voice matters.'
  }
}

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${inter.className} font-sans antialiased`}
      >
        <Providers>
          <ToasterContext />
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}

export default Layout
