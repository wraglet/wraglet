import { ChevronLeftIcon } from '@heroicons/react/24/outline'

import { chatHeaderBackButtonClassName } from '@/components/chat/chatFloaterUi'

interface ChatHeaderBackButtonProps {
  onBack: () => void
}

const ChatHeaderBackButton = ({ onBack }: ChatHeaderBackButtonProps) => (
  <button
    type="button"
    onClick={onBack}
    aria-label="Back to conversations"
    className={chatHeaderBackButtonClassName}
  >
    <ChevronLeftIcon className="h-6 w-6" />
  </button>
)

export default ChatHeaderBackButton
