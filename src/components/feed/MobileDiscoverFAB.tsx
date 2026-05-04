'use client'

import {
  mobileFabSecondaryRightClassName,
  mobileFabStackBottomClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import { IoPersonAddSharp } from 'react-icons/io5'

interface MobileDiscoverFABProps {
  onClick: () => void
}

const MobileDiscoverFAB = ({ onClick }: MobileDiscoverFABProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Discover people"
      className={cn(
        'fixed z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 text-white shadow-[0_8px_28px_-8px_rgba(14,165,233,0.55)] ring-2 ring-white/45 transition hover:scale-105 hover:shadow-[0_12px_34px_-8px_rgba(14,165,233,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 active:scale-95 sm:h-12 sm:w-12 lg:hidden',
        mobileFabSecondaryRightClassName,
        mobileFabStackBottomClassName
      )}
      aria-label="Discover People"
    >
      <IoPersonAddSharp className="h-5 w-5 drop-shadow-sm" />
    </button>
  )
}

export default MobileDiscoverFAB
