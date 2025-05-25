'use client'

import React, { useState } from 'react'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onSelectUser: (user: any) => void
  users: any[]
  isLoading: boolean
  error: string | null
  variant?: 'wraglet' | 'default'
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  open,
  onClose,
  onSelectUser,
  users,
  isLoading,
  error,
  variant = 'default'
}) => {
  const [search, setSearch] = useState('')
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={
          variant === 'wraglet'
            ? 'w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-2xl'
            : 'w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-600">Start New Chat</h2>
          <button
            onClick={onClose}
            className="px-2 text-2xl font-bold text-gray-400 hover:text-blue-500"
          >
            ×
          </button>
        </div>
        <input
          className="mb-6 w-full rounded-lg border border-blue-200 px-4 py-2 text-base focus:border-blue-400 focus:outline-none"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading ? (
          <div className="py-8 text-center text-gray-400">Loading users...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-400">{error}</div>
        ) : (
          <ul className="max-h-72 divide-y overflow-y-auto">
            {filtered.length === 0 && (
              <li className="py-4 text-center text-gray-400">No users found</li>
            )}
            {filtered.map((u) => (
              <li
                key={u._id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-blue-50"
                onClick={() => onSelectUser(u)}
              >
                <img
                  src={u.profilePicture?.url || '/default-avatar.png'}
                  alt={u.firstName}
                  className="h-10 w-10 rounded-full border border-blue-100 object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="text-xs text-gray-500">@{u.username}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
