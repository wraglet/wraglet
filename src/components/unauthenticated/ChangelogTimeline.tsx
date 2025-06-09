'use client'

import { useState } from 'react'
import {
  Calendar,
  Check,
  Code,
  MessageCircle,
  Search,
  Settings,
  Share2,
  Sparkles,
  Users,
  Zap
} from 'lucide-react'

interface ChangelogEntry {
  date: string
  version: string
  title: string
  description: string
  features: string[]
  type: 'major' | 'minor' | 'patch'
  icon: React.ReactNode
}

const changelogData: ChangelogEntry[] = [
  {
    date: '2025-06-09',
    version: '0.8.0',
    title: 'Search & Discovery Enhancement',
    description:
      'Comprehensive search functionality with enhanced discovery features',
    features: [
      'Global search across posts, users, and content',
      'Advanced search results page with filtering',
      'Real-time search suggestions',
      'Enhanced share interactions with real-time updates',
      'Improved post and share engagement tracking'
    ],
    type: 'major',
    icon: <Search className="h-6 w-6" />
  },
  {
    date: '2025-06-07',
    version: '0.7.5',
    title: 'Post Sharing Revolution',
    description: 'Complete post sharing system with real-time collaboration',
    features: [
      'Post sharing functionality with custom messages',
      'Real-time share notifications via Ably',
      'Share analytics and engagement tracking',
      'Enhanced profile integration for shared content',
      'Mobile-optimized sharing experience'
    ],
    type: 'major',
    icon: <Share2 className="h-6 w-6" />
  },
  {
    date: '2025-06-06',
    version: '0.7.0',
    title: 'Profile Customization & Settings',
    description: 'Enhanced user profile management and comprehensive settings',
    features: [
      'Advanced profile settings form with validation',
      'Real-time profile updates',
      'Mobile-responsive profile components',
      'Enhanced authentication layout',
      'Improved loading states and animations'
    ],
    type: 'major',
    icon: <Settings className="h-6 w-6" />
  },
  {
    date: '2025-05-29',
    version: '0.6.5',
    title: 'Public Pages & Information Architecture',
    description:
      'Complete unauthenticated experience with legal and help pages',
    features: [
      'Comprehensive help center',
      'Privacy policy and terms of service',
      'Cookie policy and advertising information',
      'Enhanced authentication flow',
      'Improved onboarding experience'
    ],
    type: 'minor',
    icon: <Code className="h-6 w-6" />
  },
  {
    date: '2025-05-26',
    version: '0.6.0',
    title: 'Performance & Infrastructure Upgrade',
    description: 'Major performance improvements and monitoring integration',
    features: [
      'Vercel Analytics and Speed Insights integration',
      'CDN optimization for global asset delivery',
      'Enhanced UI animations and transitions',
      'Mongoose and dependency updates',
      'Improved button accessibility and styling'
    ],
    type: 'major',
    icon: <Zap className="h-6 w-6" />
  },
  {
    date: '2025-05-25',
    version: '0.5.0',
    title: 'Real-Time Messaging Platform',
    description: 'Complete messaging system with real-time capabilities',
    features: [
      'Real-time messaging with Ably integration',
      'Chat floater for seamless conversations',
      'Unread message tracking and notifications',
      'Conversation management system',
      'Mobile-optimized chat experience'
    ],
    type: 'major',
    icon: <MessageCircle className="h-6 w-6" />
  },
  {
    date: '2025-05-03',
    version: '0.4.5',
    title: 'Profile Enhancement Suite',
    description: 'Rich profile features and achievement system',
    features: [
      'Achievement badges and milestones',
      'Bio editing with rich text support',
      'Settings layout with multiple categories',
      'Enhanced profile customization',
      'Social networking improvements'
    ],
    type: 'minor',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    date: '2025-04-26',
    version: '0.4.0',
    title: 'Social Features & Infinite Scrolling',
    description: 'Advanced social interactions and performance optimization',
    features: [
      'Follow/unfollow functionality',
      'Infinite scrolling for posts',
      'Cover photo upload with cropping',
      'Enhanced user suggestions',
      'Improved profile picture management'
    ],
    type: 'major',
    icon: <Users className="h-6 w-6" />
  },
  {
    date: '2025-04-13',
    version: '0.3.0',
    title: 'Interactive Engagement System',
    description: 'Complete post interaction suite with real-time updates',
    features: [
      'Post reactions with emoji support',
      'Voting system with live counts',
      'Comment system with threading',
      'Real-time interaction updates',
      'Enhanced UI for engagement metrics'
    ],
    type: 'major',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    date: '2025-04-03',
    version: '0.2.0',
    title: 'Core Platform Foundation',
    description: 'Major refactoring and core feature implementation',
    features: [
      'Complete model restructuring',
      'Ably real-time integration',
      'Feed skeleton loading states',
      'Comment functionality',
      'TailwindCSS 4 upgrade'
    ],
    type: 'major',
    icon: <Code className="h-6 w-6" />
  }
]

export const ChangelogTimeline = () => {
  const [selectedType, setSelectedType] = useState<'all' | 'major' | 'minor'>(
    'all'
  )

  const filteredData =
    selectedType === 'all'
      ? changelogData
      : changelogData.filter((entry) => entry.type === selectedType)

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'minor':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      case 'patch':
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="mx-auto max-w-full">
      {/* Filter Buttons */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selectedType === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Updates
        </button>
        <button
          onClick={() => setSelectedType('major')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selectedType === 'major'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Major Features
        </button>
        <button
          onClick={() => setSelectedType('minor')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selectedType === 'minor'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Enhancements
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {filteredData.map((entry, index) => (
          <div key={entry.version} className="relative">
            {/* Content Card */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:shadow-md">
              {/* Header */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium text-white ${getVersionBadgeColor(entry.type)}`}
                >
                  {entry.version}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  {entry.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {entry.title}
              </h3>
              <p className="mb-3 text-sm text-gray-600">{entry.description}</p>

              {/* Features List */}
              <div className="space-y-1">
                {entry.features.slice(0, 3).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                    <span className="text-xs text-gray-700">{feature}</span>
                  </div>
                ))}
                {entry.features.length > 3 && (
                  <div className="ml-5 text-xs text-gray-500">
                    +{entry.features.length - 3} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
