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

import MobileSettingsButton from '@/components/MobileSettingsButton'
import MobileSettingsDrawer from '@/components/MobileSettingsDrawer'

const settingsCategories = [
  { label: 'Profile', href: '/settings/profile', icon: UserIcon },
  { label: 'Account', href: '/settings/account', icon: Cog6ToothIcon },
  { label: 'Notifications', href: '/settings/notifications', icon: BellIcon },
  {
    label: 'Privacy & Security',
    href: '/settings/privacy',
    icon: ShieldCheckIcon
  }
]

interface SettingsLayoutProps {
  children: ReactNode
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const pathname = usePathname()
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  const openMobileDrawer = () => setIsMobileDrawerOpen(true)
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false)

  return (
    <>
      <div className="mx-auto mt-12 flex w-full max-w-5xl items-start gap-x-[10px] pb-20 lg:pb-0 xl:w-[1100px]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 rounded-lg bg-white p-6 shadow-md lg:block">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-neutral-700">
            Settings
          </h2>
          <nav aria-label="Settings categories">
            <ul className="space-y-1">
              {settingsCategories.map((cat) => {
                const isActive = pathname === cat.href
                const Icon = cat.icon
                return (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className={`flex items-center gap-3 rounded px-3 py-2 text-base font-medium transition-colors focus:ring-2 focus:ring-blue-200 focus:outline-none ${
                        isActive
                          ? 'bg-blue-50 font-semibold text-blue-600'
                          : 'text-neutral-700 hover:bg-blue-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {cat.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start rounded-lg bg-white p-4 shadow-md md:p-8">
          {children}
        </section>
      </div>

      {/* Mobile Components */}
      <MobileSettingsButton onClick={openMobileDrawer} />
      <MobileSettingsDrawer
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
      />
    </>
  )
}

export default SettingsLayout
