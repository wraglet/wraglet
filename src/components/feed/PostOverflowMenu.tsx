'use client'

import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { HiOutlineEllipsisHorizontal } from 'react-icons/hi2'

import Button from '@/components/shared/Button'

interface PostOverflowMenuProps {
  postId: string
  isAuthor: boolean
  onCopyLink: () => void
}

const PostOverflowMenu = ({
  postId,
  isAuthor,
  onCopyLink
}: PostOverflowMenuProps) => {
  return (
    <Menu as="div" className="relative z-50 shrink-0 self-start">
      <MenuButton className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100">
        <HiOutlineEllipsisHorizontal className="h-5 w-5" />
      </MenuButton>
      <MenuItems
        portal
        transition
        anchor={{ to: 'bottom end', gap: '0.25rem', padding: '0.5rem' }}
        className="z-[100] max-w-[calc(100vw-1rem)] min-w-[10rem] origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <div className="px-1">
          <MenuItem>
            <Link
              href={`/post/${postId}`}
              className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-focus:bg-sky-500 data-focus:text-white"
            >
              View Post
            </Link>
          </MenuItem>
          <MenuItem>
            <Button
              type="button"
              className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-focus:bg-sky-500 data-focus:text-white"
            >
              Save post
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              type="button"
              onClick={onCopyLink}
              className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-gray-900 data-focus:bg-sky-500 data-focus:text-white"
            >
              Copy link
            </Button>
          </MenuItem>
        </div>
        {isAuthor && (
          <div className="px-1">
            <MenuItem>
              <Button
                type="button"
                className="group flex w-full items-center rounded-md px-2 py-2 text-xs text-red-500 data-focus:bg-red-500 data-focus:text-white"
              >
                Delete post
              </Button>
            </MenuItem>
          </div>
        )}
      </MenuItems>
    </Menu>
  )
}

export default PostOverflowMenu
