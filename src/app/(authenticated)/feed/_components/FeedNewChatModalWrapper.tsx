'use client'

import { useCallback } from 'react'
import useMessagesModalStore from '@/store/messagesModal'

import { NewChatModal } from '@/components/messages/NewChatModal'

const FeedNewChatModalWrapper = ({ otherUsers }: { otherUsers: any[] }) => {
  const { isOpen, targetUser, closeModal } = useMessagesModalStore()

  const handleSelectUser = useCallback(
    async (user: any) => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantIds: [user._id] })
        })
        const json = await res.json()
        if (json.success && json.data?._id) {
          window.location.href = `/messages/${json.data._id}`
        } else {
          alert('Failed to start chat')
        }
      } catch {
        alert('Failed to start chat')
      }
      closeModal()
    },
    [closeModal]
  )

  return (
    <NewChatModal
      open={isOpen}
      onClose={closeModal}
      users={otherUsers}
      isLoading={false}
      error={null}
      onSelectUser={handleSelectUser}
      variant="wraglet"
    />
  )
}

export default FeedNewChatModalWrapper
