'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import { BellIcon } from '@/components/NavIcons'

const HeaderNotificationsIconAbly = dynamic(
  () => import('./HeaderNotificationsIconAbly'),
  { ssr: false }
)

interface HeaderNotificationsIconClientWrapperProps {
  userId: string
}

const HeaderNotificationsIconClientWrapper = ({
  userId
}: HeaderNotificationsIconClientWrapperProps) => {
  return (
    <Suspense fallback={<BellIcon className="text-white" />}>
      <HeaderNotificationsIconAbly userId={userId} />
    </Suspense>
  )
}

export default HeaderNotificationsIconClientWrapper
