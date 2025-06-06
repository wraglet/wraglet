'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'

interface MobileSettingsButtonProps {
  onClick: () => void
}

const MobileSettingsButton = ({ onClick }: MobileSettingsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-16 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-lg transition-all duration-200 hover:shadow-xl focus:ring-4 focus:ring-blue-200 focus:outline-none lg:hidden"
      aria-label="Open Settings Menu"
    >
      <Bars3Icon className="h-6 w-6 text-gray-600" />
    </button>
  )
}

export default MobileSettingsButton
