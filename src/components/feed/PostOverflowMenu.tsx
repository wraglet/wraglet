'use client'

import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import toast from 'react-hot-toast'
import {
  HiOutlineBookmark,
  HiOutlineEllipsisHorizontal,
  HiOutlineEye,
  HiOutlineLink,
  HiOutlineTrash
} from 'react-icons/hi2'

const MENU_ITEM_BASE =
  'group flex w-full min-h-11 touch-manipulation items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-gray-900 transition-colors active:bg-sky-100 data-focus:bg-sky-500 data-focus:text-white sm:min-h-0 sm:gap-2 sm:px-2 sm:py-2 sm:text-xs'

const menuIconClass =
  'h-5 w-5 shrink-0 text-gray-500 transition-colors group-data-focus:text-white'

interface PostOverflowMenuProps {
  postId: string
  isAuthor: boolean
  onCopyLink: () => void
  viewHref?: string
}

const PostOverflowMenu = ({
  postId,
  isAuthor,
  onCopyLink,
  viewHref = `/post/${postId}`
}: PostOverflowMenuProps) => {
  const handleSavePost = () => {
    toast('Save post is coming soon')
  }

  const handleDeletePost = () => {
    toast.error('Delete post is not available yet')
  }

  return (
    <Menu as="div" className="relative z-50 shrink-0 self-start">
      <MenuButton
        type="button"
        aria-label="Post options"
        className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-gray-600 transition-colors active:bg-gray-200 data-active:bg-gray-100 data-focus:bg-gray-100 data-focus:outline-none data-focus-visible:ring-2 data-focus-visible:ring-sky-500 data-focus-visible:ring-offset-2 sm:h-8 sm:w-8"
      >
        <HiOutlineEllipsisHorizontal className="h-5 w-5" aria-hidden />
      </MenuButton>
      <MenuItems
        portal
        transition
        anchor={{ to: 'bottom end', gap: '0.25rem', padding: '0.5rem' }}
        className="z-[100] max-w-[calc(100vw-1rem)] min-w-[11rem] origin-top-right divide-y divide-gray-100 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none data-closed:scale-95 data-closed:opacity-0"
      >
        <div className="px-1">
          <MenuItem>
            <Link href={viewHref} className={MENU_ITEM_BASE}>
              <HiOutlineEye className={menuIconClass} aria-hidden />
              <span>View post</span>
            </Link>
          </MenuItem>
          <MenuItem>
            <button
              type="button"
              className={MENU_ITEM_BASE}
              onClick={handleSavePost}
            >
              <HiOutlineBookmark className={menuIconClass} aria-hidden />
              <span>Save post</span>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              type="button"
              className={MENU_ITEM_BASE}
              onClick={onCopyLink}
            >
              <HiOutlineLink className={menuIconClass} aria-hidden />
              <span>Copy link</span>
            </button>
          </MenuItem>
        </div>
        {isAuthor ? (
          <div className="px-1">
            <MenuItem>
              <button
                type="button"
                className={`${MENU_ITEM_BASE} text-red-600 data-focus:bg-red-500 data-focus:text-white`}
                onClick={handleDeletePost}
              >
                <HiOutlineTrash
                  className={`${menuIconClass} text-red-500 group-data-focus:text-white`}
                  aria-hidden
                />
                <span>Delete post</span>
              </button>
            </MenuItem>
          </div>
        ) : null}
      </MenuItems>
    </Menu>
  )
}

export default PostOverflowMenu
