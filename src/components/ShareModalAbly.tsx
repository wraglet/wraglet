'use client'

import dynamic from 'next/dynamic'

const ShareModal = dynamic(() => import('@/components/ShareModal'), {
  ssr: false
})

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: any
  onShareToFeed?: () => void
}

const ShareModalAbly = (props: ShareModalProps) => {
  // For now, just use the existing ShareModal
  // TODO: Implement proper Ably pattern later
  return <ShareModal {...props} />
}

export default ShareModalAbly
