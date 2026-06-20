'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useIsClient } from '@/lib/hooks/useIsClient'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'

import Avatar from '@/components/shared/Avatar'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onSelectUser: (user: any) => void
  users: any[]
  isLoading: boolean
  error: string | null
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  open,
  onClose,
  onSelectUser,
  users,
  isLoading,
  error
}) => {
  const isClient = useIsClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) dialog.showModal()
      return
    }

    if (dialog.open) dialog.close()
  }, [open])

  const filtered = users.filter((user) => {
    if (!user) return false
    const query = search.toLowerCase()
    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`

    return [user.username, fullName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })
  if (!open || !isClient) return null

  let content: React.ReactNode
  if (isLoading) {
    content = (
      <div className="py-8 text-center text-sm text-gray-400">
        Loading users...
      </div>
    )
  } else if (error) {
    content = (
      <div className="py-8 text-center text-sm text-red-400">{error}</div>
    )
  } else {
    content = (
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {filtered.length === 0 && (
          <li className="py-4 text-center text-sm text-gray-400">
            No users found
          </li>
        )}
        {filtered.map((u) => (
          <li key={`new-chat-${u._id}`}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-sky-50"
              onClick={() => onSelectUser(u)}
            >
              <Avatar
                src={u.profilePicture?.url || null}
                alt={`${u.firstName}'s avatar`}
                size="h-9 w-9"
                gender={u.gender}
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {u.firstName} {u.lastName}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {u.username}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="new-chat-modal-title"
      className="fixed inset-0 z-[100] m-0 flex max-h-none w-full max-w-none items-end justify-center border-0 bg-transparent p-0 backdrop:bg-black/30 backdrop:backdrop-blur-sm sm:items-center sm:px-4"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="flex max-h-[min(85dvh,calc(100dvh-3.5rem))] w-full max-w-md flex-col rounded-t-2xl border border-neutral-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-xl sm:max-h-[min(32rem,85dvh)] sm:rounded-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="new-chat-modal-title"
            className="text-base font-semibold text-gray-900"
          >
            Start New Chat
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0EA5E9]"
            aria-label="Close new chat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <input
          className="mb-3 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {content}
      </div>
    </dialog>,
    document.body
  )
}
