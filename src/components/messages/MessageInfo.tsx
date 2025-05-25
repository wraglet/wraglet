const MessageInfo = ({ selectedId }: { selectedId: string | null }) => (
  <aside
    className={`hidden w-1/4 max-w-xs pt-14 pl-4 lg:block ${selectedId ? '' : 'lg:hidden'}`}
  >
    {selectedId && (
      <div className="rounded-lg bg-white p-4 shadow">
        Chat Info / Placeholder
      </div>
    )}
  </aside>
)

export default MessageInfo
