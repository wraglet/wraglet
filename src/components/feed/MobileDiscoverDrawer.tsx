'use client'

import { useEffect } from 'react'
import type { DiscoverUser } from '@/interfaces'
import { IoClose } from 'react-icons/io5'

import MobileDiscoverUserSuggestion from '@/components/feed/MobileDiscoverUserSuggestion'

interface MobileDiscoverDrawerProps {
  isOpen: boolean
  onClose: () => void
  otherUsers: DiscoverUser[]
}

const MobileDiscoverDrawer = ({
  isOpen,
  onClose,
  otherUsers
}: MobileDiscoverDrawerProps) => {
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
      <button
        type="button"
        aria-label="Close discover people"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] border-l border-neutral-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h2 className="text-base font-semibold text-gray-900">
              Discover People
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
              aria-label="Close discover people"
            >
              <IoClose className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {otherUsers.map((user) => (
                <MobileDiscoverUserSuggestion
                  key={`mobile-discover-${user._id}`}
                  user={user}
                  onProfileNavigate={onClose}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileDiscoverDrawer
