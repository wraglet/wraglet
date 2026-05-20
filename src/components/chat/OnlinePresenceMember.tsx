'use client'

import { useEffect } from 'react'
import { ONLINE_PRESENCE_CHANNEL } from '@/lib/onlinePresenceChannel'
import useOnlinePresenceStore from '@/store/onlinePresence'
import { usePresence, usePresenceListener } from 'ably/react'

/** Enters app-wide presence and syncs online client IDs to the store. */
const OnlinePresenceMember = () => {
  const setOnlineUserIds = useOnlinePresenceStore(
    (state) => state.setOnlineUserIds
  )

  usePresence(ONLINE_PRESENCE_CHANNEL, 'online')

  const { presenceData } = usePresenceListener(ONLINE_PRESENCE_CHANNEL)

  useEffect(() => {
    const ids = new Set<string>()
    for (const member of presenceData) {
      if (member.clientId) ids.add(member.clientId)
    }
    setOnlineUserIds(ids)
  }, [presenceData, setOnlineUserIds])

  return null
}

export default OnlinePresenceMember
