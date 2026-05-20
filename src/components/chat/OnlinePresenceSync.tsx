'use client'

import { useEffect } from 'react'
import { ONLINE_PRESENCE_CHANNEL } from '@/lib/onlinePresenceChannel'
import useOnlinePresenceStore from '@/store/onlinePresence'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import { ChannelProvider } from 'ably/react'

import OnlinePresenceMember from '@/components/chat/OnlinePresenceMember'

const collectConversationUserIds = (
  conversations: { participants?: { _id?: string }[] }[],
  currentUserId: string
): Set<string> => {
  const ids = new Set<string>()
  for (const conversation of conversations) {
    for (const participant of conversation.participants ?? []) {
      const id = participant._id
      if (id && id !== currentUserId) ids.add(id)
    }
  }
  return ids
}

const OnlinePresenceSync = () => {
  const currentUserId = useUserStore((state) => state.user?._id)
  const setMutualUserIds = useOnlinePresenceStore(
    (state) => state.setMutualUserIds
  )
  const setConversationUserIds = useOnlinePresenceStore(
    (state) => state.setConversationUserIds
  )

  const { data: mutualIds = [] } = useQuery({
    queryKey: ['follow-mutuals', currentUserId],
    queryFn: async () => {
      const res = await fetch('/api/follows/mutuals')
      if (!res.ok) return []
      const json = (await res.json()) as { mutualIds?: string[] }
      return json.mutualIds ?? []
    },
    enabled: Boolean(currentUserId),
    staleTime: 60_000
  })

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      const json = await res.json()
      return (json.data ?? []) as { participants?: { _id?: string }[] }[]
    },
    enabled: Boolean(currentUserId),
    staleTime: 30_000
  })

  useEffect(() => {
    setMutualUserIds(new Set(mutualIds))
  }, [mutualIds, setMutualUserIds])

  useEffect(() => {
    if (!currentUserId) {
      setConversationUserIds(new Set())
      return
    }
    setConversationUserIds(
      collectConversationUserIds(conversations, currentUserId)
    )
  }, [conversations, currentUserId, setConversationUserIds])

  if (!currentUserId) return null

  return (
    <ChannelProvider channelName={ONLINE_PRESENCE_CHANNEL}>
      <OnlinePresenceMember />
    </ChannelProvider>
  )
}

export default OnlinePresenceSync
