'use client'

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
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

  useEffect(() => {
    if (!session?.user?._id) {
      startTransition(() => {
        setAblyClient(null)
        setChatClient(null)
      })
      return
    }

    const client = new Ably.Realtime({
      authUrl: '/api/token',
      clientId: session.user._id
    })
    const chat = new ChatClient(client)
    startTransition(() => {
      setAblyClient(client)
      setChatClient(chat)
    })

    return () => {
      if (client.connection.state === 'connected') {
        client.close()
      }
    }
  }, [session])

  if (!ablyClient || !chatClient) {
    // You might want to show a global loader here
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
