'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { FaImage, FaUpload } from 'react-icons/fa6'

import CrossWhite from '@/components/CrossWhite'

interface AddPhotoModalProps {
  show: boolean
  onClose: () => void
  onSelect: (photos: string[]) => void
  existingPhotos: {
    url: string
    type: 'post' | 'avatar'
    createdAt: string
  }[]
}

const AddPhotoModal = ({
  show,
  onClose,
  onSelect,
  existingPhotos
}: AddPhotoModalProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing')

  const handleSelect = (url: string) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos(selectedPhotos.filter((photo) => photo !== url))
    } else if (selectedPhotos.length < 9) {
      setSelectedPhotos([...selectedPhotos, url])
    }
  }

  const handleConfirm = () => {
    onSelect(selectedPhotos)
    onClose()
  }

  return (
    <Transition appear show={show} as={Fragment}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="relative mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add Photos to Collection
                  </h2>
                  <button
                    onClick={onClose}
                    className="absolute top-0 right-0 rounded-md p-1 hover:bg-slate-100"
                  >
                    <CrossWhite fill="#374151" />
                  </button>
                </div>

                <div className="mb-6 flex gap-x-4 border-b border-gray-200">
                  <button
                    className={`relative pb-4 text-sm font-medium ${
                      activeTab === 'existing'
                        ? 'text-sky-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('existing')}
                  >
                    <div className="flex items-center gap-x-2">
                      <FaImage />
                      <span>Your Photos</span>
                    </div>
                    {activeTab === 'existing' && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-600"></div>
                    )}
                  </button>
                  <button
                    className={`relative pb-4 text-sm font-medium ${
                      activeTab === 'upload'
                        ? 'text-sky-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('upload')}
                  >
                    <div className="flex items-center gap-x-2">
                      <FaUpload />
                      <span>Upload New</span>
                    </div>
                    {activeTab === 'upload' && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-600"></div>
                    )}
                  </button>
                </div>

                {activeTab === 'existing' ? (
                  <div className="grid max-h-[400px] grid-cols-4 gap-4 overflow-y-auto p-2">
                    {existingPhotos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(photo.url)}
                        className={`group relative aspect-square overflow-hidden rounded-lg ${
                          selectedPhotos.includes(photo.url)
                            ? 'ring-2 ring-sky-500'
                            : ''
                        }`}
                      >
                        <Image
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div
                          className={`absolute inset-0 ${
                            selectedPhotos.includes(photo.url)
                              ? 'bg-opacity-20 bg-sky-500'
                              : 'bg-opacity-0 group-hover:bg-opacity-10 bg-black'
                          }`}
                        ></div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[400px] items-center justify-center">
                    {/* TODO: Implement upload functionality */}
                    <div className="text-center">
                      <FaUpload className="mx-auto mb-4 text-4xl text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Upload functionality coming soon
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <span className="text-sm text-gray-500">
                    {selectedPhotos.length} selected
                  </span>
                  <div className="flex gap-x-3">
                    <button
                      onClick={onClose}
                      className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={selectedPhotos.length === 0}
                      className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Add Selected
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

export default AddPhotoModal
