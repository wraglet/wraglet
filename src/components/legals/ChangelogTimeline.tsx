'use client'

import { useState } from 'react'
import {
  Bell,
  BookOpen,
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
    date: '2026-05-04',
    version: '0.9.2',
    title: 'UI polish, mobile layouts, and Storybook aligned with production',
    description:
      'Beautified shell and content surfaces with stronger mobile responsiveness—header, floaters, blog, settings, and posts—plus navigation fixes on small screens and Storybook stories that use the same fixtures and types as the live app',
    features: [
      'UI refinements: spacing, typography, and hierarchy across the header, chat/notification floaters, and authenticated chrome',
      'Mobile responsiveness: breakpoints, stacking, and touch targets improved for feed, blog, and settings',
      'Blog surfaces (detail, cards, edit, image upload): clearer layout and cover treatment on phones and tablets',
      'Settings: section layout and forms read better on narrow viewports',
      'Post components: card and interaction UI (votes, comments, sharing affordances) polished for feed readability',
      'Mobile navigation: drawer/sheet behavior and nav alignment fixes so the shell matches intent on small screens',
      'FeedBlogCard stories (full card and compact no-cover) use IBlog-shaped data from storybookUsers, matching production',
      'BlogDetail stories share the published-blog fixture and AuthorInterface author model with the app',
      'Shared STORYBOOK_BLOG_COVER_GRADIENT and reusable IBlog samples (`storybookIBlogPublishedSample`, `storybookIBlogFeedCompact`) for stories',
      'Blog edit and image-upload stories use the shared cover asset instead of one-off SVGs',
      'Storybook static build kept green so the catalog stays shippable with the repo'
    ],
    type: 'patch',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    date: '2026-04-28',
    version: '0.9.1',
    title: 'Testing stack, E2E, and seed data hardening',
    description:
      'Clearer Vitest and Playwright standards, safer E2E seeding, and broader browser coverage for critical paths',
    features: [
      'Testing source of truth in docs/TESTING.md: Vitest, React Testing Library, Playwright; no Jest for new work',
      'Global setup and seed-e2e-user script: production guards, wraglet.local email rules, and stable post/blog fixtures for journeys',
      'E2E specs expanded for public pages, navigation, auth guard, authenticated flows, journeys, content, and cookie-backed API checks',
      'Contributor docs (README, DEVELOPMENT, e2e helpers) updated so CI and local runs behave the same way'
    ],
    type: 'patch',
    icon: <Check className="h-6 w-6" />
  },
  {
    date: '2026-04-04',
    version: '0.9.0',
    title: 'Wraglet Blogs & Next.js 16 Platform Upgrade',
    description:
      'Full blogging experience on Wraglet plus a framework upgrade that closes known Next.js / React 19 security gaps',
    features: [
      'Blogs with rich blocks (text, code, images, video), categories, tags, covers, drafts, and stable slugs',
      'Discovery and author dashboard to create, edit, publish, and manage posts',
      'Comments and reactions (same emoji types as the feed) with real-time updates',
      'Share blogs to the feed with a preview card and notifications for new posts',
      'Upgraded to Next.js 16 to address React 19–related CVEs and align with current security guidance',
      'Feed fix: multiple posts by the same author no longer show as “Unknown user” (API serialization of shared author objects)',
      'Feed fix: post cards keep correct author names and avatars after follow actions and Ably reaction or vote updates',
      'Chat floater: opening the bubble lists recent conversations with avatars; each thread can show an unread count badge',
      'Chat floater: new messages pin the conversation so you can open it from the stack, not only via the header menu',
      'Chat avatars: missing or invalid profile image URLs fall back cleanly without Next/Image console errors',
      'Chat: closing a floating window no longer triggers Ably presence leave errors during room teardown'
    ],
    type: 'major',
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    date: '2025-06-10',
    version: '0.8.1',
    title: 'Shared Post Notifications & UI Fixes',
    description:
      'Critical fixes for shared post notifications and restored Lottie reaction animations',
    features: [
      'Fixed shared post notification redirects to properly link to shared content',
      'Resolved Ably context error when viewing shared posts directly',
      'Restored Lottie reaction emoji animations throughout the platform',
      'Enhanced notification system to handle both posts and shares correctly',
      'Improved post page consistency with feed reaction experience'
    ],
    type: 'patch',
    icon: <Bell className="h-6 w-6" />
  },
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
                {entry.features.slice(0, 3).map((feature) => (
                  <div
                    key={`${entry.version}:${feature}`}
                    className="flex items-start gap-2"
                  >
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
