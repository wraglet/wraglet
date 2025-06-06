'use client'

import { useState } from 'react'
import { UserInterface } from '@/interfaces'

import MobileDiscoverDrawer from '@/components/MobileDiscoverDrawer'
import MobileDiscoverFAB from '@/components/MobileDiscoverFAB'

interface MobileResponsiveWrapperProps {
  otherUsers: UserInterface[]
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
