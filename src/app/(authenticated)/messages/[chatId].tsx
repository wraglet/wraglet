import dynamic from 'next/dynamic'

const MessagesChatClient = dynamic(
  () => import('@/components/messages/MessagesChatClient'),
  { ssr: false }
)

const MessagePage = async ({
  params
}: {
  params: Promise<{ chatId: string }>
}) => {
  const { chatId } = await params
  // Optionally, fetch conversation details here using chatId and getCurrentUser
  // const conversation = await getConversationById(chatId, currentUserId)
  return <MessagesChatClient chatId={chatId} />
}

export default MessagePage
