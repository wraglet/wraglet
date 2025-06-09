import { Metadata } from 'next'

import { ChangelogTimeline } from '@/components/unauthenticated/ChangelogTimeline'

export const metadata: Metadata = {
  title: 'Changelog - Wraglet',
  description:
    'Track the evolution of Wraglet - discover new features, improvements, and milestones in our journey to create authentic social connections.',
  openGraph: {
    title: 'Wraglet Changelog',
    description:
      'Track the evolution of Wraglet - discover new features, improvements, and milestones in our journey to create authentic social connections.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wraglet Changelog',
    description:
      'Track the evolution of Wraglet - discover new features, improvements, and milestones in our journey to create authentic social connections.'
  }
}

const ChangelogPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
          Wraglet Changelog
        </h1>
        <p className="text-sm leading-relaxed text-gray-600">
          Follow our journey as we build the future of authentic social
          connections. Every feature, every improvement, every milestone that
          brings us closer to our vision.
        </p>
      </div>

      <ChangelogTimeline />
    </div>
  )
}

export default ChangelogPage
