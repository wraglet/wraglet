'use client'

import { Activity } from 'react'
import dynamic from 'next/dynamic'
import { authenticatedProfileMainClassName } from '@/lib/uiChrome'
import useBlogModalStore from '@/store/blogModal'
import { Dialog, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

import type { ProfileFeedItem } from '@/types/profileFeed'
import Header from '@/components/profile/Header'
import ProfilePostsClientWrapper from '@/components/profile/ProfilePostsClientWrapper'

const BlogCreateForm = dynamic(
  () => import('@/components/blog/BlogCreateForm'),
  { ssr: false }
)

interface ProfilePageClientProps {
  username: string
  initialPosts: ProfileFeedItem[]
}

const ProfilePageClient = ({
  username,
  initialPosts
}: ProfilePageClientProps) => {
  const { isOpen: showBlogModal, closeModal: closeBlogModal } =
    useBlogModalStore()

  return (
    <>
      <main className={authenticatedProfileMainClassName}>
        <Header username={username} />
        <ProfilePostsClientWrapper
          initialPosts={initialPosts}
          username={username}
        />
      </main>

      <Activity mode={showBlogModal ? 'visible' : 'hidden'}>
        <Dialog
          as="div"
          className="relative z-50"
          open={showBlogModal}
          onClose={closeBlogModal}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-[100dvh] items-center justify-center px-2 py-3 sm:min-h-full sm:p-4">
              <DialogPanel className="relative flex max-h-[min(92dvh,100svh)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all max-sm:rounded-lg sm:max-h-[90dvh]">
                <button
                  type="button"
                  onClick={closeBlogModal}
                  className="absolute top-2 right-2 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none sm:top-4 sm:right-4"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <div className="max-h-[min(92dvh,100svh)] min-h-0 flex-1 overflow-y-auto sm:max-h-[90dvh]">
                  <BlogCreateForm onSuccess={closeBlogModal} />
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </Activity>
    </>
  )
}

export default ProfilePageClient
