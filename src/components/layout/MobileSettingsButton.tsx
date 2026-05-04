'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'

interface MobileSettingsButtonProps {
  onClick: () => void
}

const MobileSettingsButton = ({ onClick }: MobileSettingsButtonProps) => {
  return (
    <button
      type="button"
      title="Menu"
      onClick={onClick}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 lg:hidden"
      aria-label="Open Settings Menu"
    >
      <Bars3Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
    </button>
  )
}

export default MobileSettingsButton
