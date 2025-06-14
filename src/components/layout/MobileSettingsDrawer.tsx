'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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

interface MobileSettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const MobileSettingsDrawer = ({
  isOpen,
  onClose
}: MobileSettingsDrawerProps) => {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4" aria-label="Settings categories">
            <ul className="space-y-2">
              {settingsCategories.map((cat) => {
                const isActive = pathname === cat.href
                const Icon = cat.icon
                return (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      onClick={onClose} // Close drawer when navigating
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 font-semibold text-blue-600'
                          : 'text-neutral-700 hover:bg-blue-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      {cat.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default MobileSettingsDrawer
