import {
  messagesEmptyCenterClassName,
  messagesEmptyLoadingClassName,
  messagesEmptyMobileHintClassName,
  messagesEmptyNewChatButtonClassName,
  messagesEmptySidebarHintClassName
} from '@/components/chat/messagesEmptyPaneClassNames'

interface MessagesEmptyPaneProps {
  isLoading: boolean
  hasConversations: boolean
  onNewChat: () => void
}

const MessagesEmptyPane = ({
  isLoading,
  hasConversations,
  onNewChat
}: MessagesEmptyPaneProps) => {
  if (isLoading) {
    return (
      <p className={messagesEmptyLoadingClassName}>Loading conversations…</p>
    )
  }

  return (
    <>
      {hasConversations ? null : (
        <button
          type="button"
          onClick={onNewChat}
          className={messagesEmptyNewChatButtonClassName}
        >
          + New Chat
        </button>
      )}
      <div className={messagesEmptyCenterClassName}>
        <p>
          {hasConversations
            ? 'Select a conversation to start chatting'
            : 'No conversations yet'}
        </p>
        <p className={messagesEmptySidebarHintClassName}>
          Choose a conversation from the sidebar
        </p>
        {hasConversations ? null : (
          <p className={messagesEmptyMobileHintClassName}>
            Start a new chat to connect with someone
          </p>
        )}
      </div>
    </>
  )
}

export default MessagesEmptyPane
