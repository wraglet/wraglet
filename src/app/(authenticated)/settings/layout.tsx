'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'

import MobileSettingsButton from '@/components/layout/MobileSettingsButton'
import MobileSettingsDrawer from '@/components/layout/MobileSettingsDrawer'

const settingsCategories = [
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: UserIcon,
    description: 'Manage your personal information and preferences'
  },
  {
    label: 'Account',
    href: '/settings/account',
    icon: Cog6ToothIcon,
    description: 'Manage sign-in details for your Wraglet account.'
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    icon: BellIcon,
    description: 'Choose how Wraglet keeps you updated.'
  },
  {
    label: 'Privacy & Security',
    href: '/settings/privacy',
    icon: ShieldCheckIcon,
    description: 'Control who can see and interact with your profile.'
  }
]

interface SettingsLayoutProps {
  children: ReactNode
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const pathname = usePathname()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const activeCategory =
    settingsCategories.find((category) => pathname === category.href) ??
    settingsCategories[0]

  const openMobileDrawer = () => setIsMobileDrawerOpen(true)
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false)

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl items-start gap-x-4 px-4 pt-20 pb-20 lg:pb-4 xl:w-[1100px]">
        {/* Desktop Sidebar */}
        <aside className="sticky top-20 hidden w-56 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm lg:block">
          <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-neutral-700">
            Settings
          </h2>
          <nav aria-label="Settings categories">
            <ul className="space-y-0.5">
              {settingsCategories.map((cat) => {
                const isActive = pathname === cat.href
                const Icon = cat.icon
                return (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                        isActive
                          ? 'bg-sky-50 font-semibold text-[#0EA5E9]'
                          : 'text-neutral-700 hover:bg-sky-50 hover:text-[#0EA5E9]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {cat.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start">
          <div className="sticky top-14 z-30 mb-4 flex w-full items-start gap-3 border-b border-neutral-200/80 py-2.5 lg:hidden">
            <MobileSettingsButton onClick={openMobileDrawer} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold tracking-tight text-gray-900">
                {activeCategory.label}
              </h1>
              <p className="mt-0.5 line-clamp-1 text-xs text-gray-600">
                {activeCategory.description}
              </p>
            </div>
          </div>
          {children}
        </section>
      </div>

      {/* Mobile Components */}
      <MobileSettingsDrawer
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
      />
    </>
  )
}

export default SettingsLayout
