'use client'

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState
} from 'react'
import { useSession } from 'next-auth/react'
import { ChatClient } from '@ably/chat'
import { ChatClientProvider } from '@ably/chat/react'
import * as Ably from 'ably'
import { AblyProvider as AblyReactProvider } from 'ably/react'

interface AblyContextType {
  ablyClient: Ably.Realtime | null
  chatClient: ChatClient | null
}

const AblyContext = createContext<AblyContextType>({
  ablyClient: null,
  chatClient: null
})

export const useAblyContext = () => {
  return useContext(AblyContext)
}

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null)
  const [chatClient, setChatClient] = useState<ChatClient | null>(null)

  const teardownClients = useEffectEvent(
    (client: Ably.Realtime | null, chat: ChatClient | null) => {
      startTransition(() => {
        setAblyClient(client)
        setChatClient(chat)
      })
    }
  )

  const closeClient = useEffectEvent((client: Ably.Realtime) => {
    if (client.connection.state === 'connected') {
      client.close()
    }
  })

  useEffect(() => {
    const userId = session?.user?._id

    if (!userId) {
      teardownClients(null, null)
      return
    }

    const client = new Ably.Realtime({
      authUrl: '/api/token',
      clientId: userId
    })
    const chat = new ChatClient(client)
    teardownClients(client, chat)

    return () => {
      closeClient(client)
    }
  }, [session?.user?._id])

  if (!ablyClient || !chatClient) {
    return null
  }

  return (
    <AblyContext.Provider value={{ ablyClient, chatClient }}>
      <AblyReactProvider client={ablyClient}>
        <ChatClientProvider client={chatClient}>{children}</ChatClientProvider>
      </AblyReactProvider>
    </AblyContext.Provider>
  )
}
