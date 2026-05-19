'use client'

import { useState } from 'react'
import type { DiscoverUser } from '@/interfaces'

import MobileDiscoverDrawer from '@/components/feed/MobileDiscoverDrawer'
import MobileDiscoverFAB from '@/components/feed/MobileDiscoverFAB'

interface MobileResponsiveWrapperProps {
  otherUsers: DiscoverUser[]
}

const MobileResponsiveWrapper = ({
  otherUsers
}: MobileResponsiveWrapperProps) => {
  const [isDiscoverDrawerOpen, setIsDiscoverDrawerOpen] = useState(false)

  const openDiscoverDrawer = () => setIsDiscoverDrawerOpen(true)
  const closeDiscoverDrawer = () => setIsDiscoverDrawerOpen(false)

  return (
    <>
      {/* Mobile Floating Action Button for Discover People */}
      <MobileDiscoverFAB onClick={openDiscoverDrawer} />

      {/* Mobile Discover Drawer */}
      <MobileDiscoverDrawer
        isOpen={isDiscoverDrawerOpen}
        onClose={closeDiscoverDrawer}
        otherUsers={otherUsers || []}
      />
    </>
  )
}

export default MobileResponsiveWrapper
