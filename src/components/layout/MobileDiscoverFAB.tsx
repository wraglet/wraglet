'use client'

import { IoPersonAddSharp } from 'react-icons/io5'

interface MobileDiscoverFABProps {
  onClick: () => void
}

const MobileDiscoverFAB = ({ onClick }: MobileDiscoverFABProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed right-20 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl focus:ring-4 focus:ring-[#0EA5E9]/20 focus:outline-none lg:hidden"
      aria-label="Discover People"
    >
      <IoPersonAddSharp className="h-5 w-5" />
    </button>
  )
}

export default MobileDiscoverFAB
