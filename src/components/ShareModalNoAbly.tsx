'use client'

import { Fragment, useState } from 'react'
import useUserStore from '@/store/user'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  FaFacebookF,
  FaGlobeAmericas,
  FaLock,
  FaTwitter,
  FaUserFriends,
  FaWhatsapp
} from 'react-icons/fa'
import { HiLink, HiX } from 'react-icons/hi'

import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: any
  onShareToFeed?: () => void
}

const ShareModalNoAbly = ({
  isOpen,
  onClose,
  post,
  onShareToFeed
}: ShareModalProps) => {
  const { user } = useUserStore()
  const [selectedVisibility, setSelectedVisibility] = useState<
    'public' | 'mutuals' | 'only_me'
  >('public')
  const [shareMessage, setShareMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  const visibilityOptions = [
    {
      value: 'public' as const,
      icon: FaGlobeAmericas,
      label: 'Public',
      description: 'Anyone can see this shared post'
    },
    {
      value: 'mutuals' as const,
      icon: FaUserFriends,
      label: 'Mutuals',
      description: 'Only people you both follow can see this'
    },
    {
      value: 'only_me' as const,
      icon: FaLock,
      label: 'Only me',
      description: 'Only you can see this shared post'
    }
  ]

  const handleShareToFeed = async () => {
    if (!user) return

    setIsSharing(true)
    try {
      const response = await axios.post('/api/shares', {
        originalPostId: post._id,
        visibility: selectedVisibility,
        message: shareMessage.trim()
      })

      if (response.status === 200) {
        toast.success('Post shared to your feed!')
        onShareToFeed?.()
        onClose()
        setShareMessage('')
        setSelectedVisibility('public')
      }
    } catch (error: any) {
      console.error('Error sharing post:', error)
      if (error.response?.status === 409) {
        toast.error('You have already shared this post')
      } else {
        toast.error('Failed to share post')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleExternalShare = async (platform: string) => {
    const postUrl = `${window.location.origin}/post/${post._id}`
    const shareText = `Check out this post by ${post.author.firstName} ${post.author.lastName} on Wraglet!`

    switch (platform) {
      case 'link':
        try {
          await navigator.clipboard.writeText(postUrl)
          toast.success('Link copied to clipboard!')
        } catch (error) {
          toast.error('Failed to copy link')
        }
        break
      case 'native':
        if ('share' in navigator) {
          try {
            await navigator.share({
              title: `Post by ${post.author.firstName} ${post.author.lastName}`,
              text: post.content.text || shareText,
              url: postUrl
            })
          } catch (error) {
            // User cancelled or error occurred
          }
        }
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
          '_blank'
        )
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
          '_blank'
        )
        break
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`,
          '_blank'
        )
        break
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-opacity-25 fixed inset-0 bg-black" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Share Post
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>

                {/* Share to Feed Section */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-900">
                    Share to your feed
                  </h4>

                  {/* User Avatar and Message Input */}
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar
                      gender={user?.gender}
                      src={user?.profilePicture?.url || null}
                      size="h-10 w-10"
                    />
                    <div className="flex-1">
                      <textarea
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        placeholder="Add a message (optional)..."
                        className="w-full resize-none rounded-lg border border-gray-200 p-3 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        rows={3}
                        maxLength={280}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {shareMessage.length}/280
                      </p>
                    </div>
                  </div>

                  {/* Visibility Options */}
                  <div className="mb-4 space-y-2">
                    {visibilityOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSelectedVisibility(option.value)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-colors ${
                            selectedVisibility === option.value
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent
                            className={`h-5 w-5 ${
                              selectedVisibility === option.value
                                ? 'text-sky-600'
                                : 'text-gray-400'
                            }`}
                          />
                          <div className="text-left">
                            <p
                              className={`font-medium ${
                                selectedVisibility === option.value
                                  ? 'text-sky-900'
                                  : 'text-gray-900'
                              }`}
                            >
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <Button
                    onClick={handleShareToFeed}
                    disabled={isSharing}
                    className="w-full bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
                  >
                    {isSharing ? 'Sharing...' : 'Share to Feed'}
                  </Button>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200"></div>

                {/* External Share Section */}
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-900">
                    Share externally
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleExternalShare('link')}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                    >
                      <HiLink className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Copy Link
                      </span>
                    </button>

                    {'share' in navigator && (
                      <button
                        onClick={() => handleExternalShare('native')}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                      >
                        <span className="text-lg">📱</span>
                        <span className="text-sm font-medium text-gray-900">
                          More
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => handleExternalShare('twitter')}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                    >
                      <FaTwitter className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-900">
                        Twitter
                      </span>
                    </button>

                    <button
                      onClick={() => handleExternalShare('facebook')}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                    >
                      <FaFacebookF className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Facebook
                      </span>
                    </button>

                    <button
                      onClick={() => handleExternalShare('whatsapp')}
                      className="col-span-2 flex items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                    >
                      <FaWhatsapp className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        WhatsApp
                      </span>
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ShareModalNoAbly
