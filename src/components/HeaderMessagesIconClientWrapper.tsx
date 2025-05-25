'use client'

import dynamic from 'next/dynamic'

interface HeaderMessagesIconClientWrapperProps {
  userId: string
}

const HeaderMessagesIconAbly = dynamic(
  () => import('./HeaderMessagesIconAbly'),
  { ssr: false }
)

const HeaderMessagesIconClientWrapper = ({
  userId
}: HeaderMessagesIconClientWrapperProps) => {
  return <HeaderMessagesIconAbly userId={userId} />
}

export default HeaderMessagesIconClientWrapper
