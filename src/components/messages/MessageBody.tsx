interface Message {
  _id: string
  sender: any
  content: string
  createdAt: string
}

const MessageBody = ({
  messages,
  selectedId
}: {
  messages: Message[]
  selectedId: string | null
}) => (
  <section className="flex w-full max-w-2xl flex-1 flex-col pt-14">
    <div className="flex-1 overflow-y-auto p-4">
      {!selectedId ? (
        <div className="flex h-full items-center justify-center text-gray-400">
          Select a conversation to start chatting
        </div>
      ) : messages.length === 0 ? (
        <div className="text-gray-400">No messages yet</div>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m._id} className="rounded bg-gray-100 px-3 py-2">
              <div className="text-xs text-gray-500">
                {m.sender?.username || 'Unknown'} •{' '}
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div>{m.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
    {selectedId && (
      <div className="border-t p-2">
        <form className="flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2"
            placeholder="Type a message..."
            disabled
          />
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
            disabled
          >
            Send
          </button>
        </form>
      </div>
    )}
  </section>
)

export default MessageBody
