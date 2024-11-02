import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wraglet Feed - Explore Impactful Connections',
  description:
    'Explore the Wraglet Feed, where impactful connections unfold. Join us for brevity, resonance, and a future where every voice matters.',
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
    title: 'Wraglet Feed - Explore Impactful Connections',
    images: {
      url: 'https://wraglet.com/images/logo/logo.png',
      alt: 'Wraglet - Redefining Social Connection',
      type: 'image/png',
      width: 300,
      height: 300
    },
    siteName: 'Wraglet Feed',
    description:
      'Discover impactful connections on the Wraglet Feed. Redefining social media with brevity and resonance. Join us for a future where every voice matters.'
  }
}

const FeedLayout = async ({ children }: { children: React.ReactNode }) => {
  return children
}

export default FeedLayout
