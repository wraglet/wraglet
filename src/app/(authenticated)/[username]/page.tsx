'use client'

import { Fragment, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import getPostsByUsername from '@/actions/getPostsByUsername'
import useBlogModalStore from '@/store/blogModal'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

import Header from '@/components/profile/Header'
import ProfilePostsClientWrapper from '@/components/profile/ProfilePostsClientWrapper'

const BlogCreateForm = dynamic(
  () => import('@/components/blog/BlogCreateForm'),
  {
    ssr: false
  }
)

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

const ProfilePage = ({ params }: ProfilePageProps) => {
  const { isOpen: showBlogModal, closeModal: closeBlogModal } =
    useBlogModalStore()
  const [username, setUsername] = useState<string>('')
  const [initialPosts, setInitialPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeData = async () => {
      try {
        const resolvedParams = await params
        const decodedUsername = decodeURIComponent(resolvedParams.username)
        setUsername(decodedUsername)

        const posts = await getPostsByUsername(decodedUsername)
        setInitialPosts(posts)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="relative flex min-h-screen w-full flex-col items-center gap-y-4 overflow-hidden pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] sm:gap-y-5 lg:gap-y-6 lg:pb-6">
        <Header username={username} />
        <ProfilePostsClientWrapper
          initialPosts={initialPosts}
          username={username}
        />
      </main>

      {/* Blog Modal */}
      <Transition appear show={showBlogModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeBlogModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-[100dvh] items-center justify-center px-2 py-3 sm:min-h-full sm:p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
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
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default ProfilePage
