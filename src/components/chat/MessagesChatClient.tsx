'use client'

interface MessagesChatClientProps {
  chatId: string
}

const MessagesChatClient = ({ chatId }: MessagesChatClientProps) => {
  return <div>Chat for conversation: {chatId}</div>
}

export default MessagesChatClient
