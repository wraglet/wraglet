export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import './globals.css';
import AuthContext from '@/context/AuthContext';
import ToasterContext from '@/context/ToasterContext';
import { Inter } from 'next/font/google';
import ReduxProvider from '@/providers/ReduxProvider';

const inter = Inter({ subsets: ['latin'], preload: true });

const title = 'Wraglet';

export const metadata: Metadata = {
  title: title,
  description:
    "Wraglet is more than a social platform; it's a movement towards profound connections. Embrace a future where impactful brevity takes center stage, and every voice resonates. Join Wraglet today and be part of the evolution of meaningful online interaction.",
  twitter: {
    images: {
      url: 'https://wraglet.com/images/logo/logo.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 300,
      height: 300
    }
  },
  openGraph: {
    title: title,
    images: {
      url: 'https://wraglet.com/images/logo/logo.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 300,
      height: 300
    },
    siteName: title,
    description:
      'Discover Wraglet, where concise expression meets impactful connection. Redefining social media, Wraglet fosters meaningful interactions with a focus on brevity and resonance. Join us for a future where every voice matters.'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AuthContext>
          <ReduxProvider>
            <ToasterContext />
            {children}
          </ReduxProvider>
        </AuthContext>
      </body>
    </html>
  );
}
