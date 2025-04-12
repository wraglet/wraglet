'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'

import CrossWhite from '@/components/CrossWhite'

interface AddPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  existingPhotos: Array<{
    url: string
    key: string
    type: 'post' | 'avatar'
    createdAt: string
  }>
  onUpdatePhotos: (photos: any[]) => void
}

export default function AddPhotoModal({
  isOpen,
  onClose,
  existingPhotos,
  onUpdatePhotos
}: AddPhotoModalProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      setIsLoading(true)
      try {
        const file = acceptedFiles[0]
        const reader = new FileReader()

        reader.onloadend = async () => {
          const base64Data = reader.result as string

          const response = await fetch('/api/update-photo-collection', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'upload',
              image: base64Data
            })
          })

          if (!response.ok) {
            throw new Error('Failed to upload photo')
          }

          const newPhoto = await response.json()
          onUpdatePhotos([...existingPhotos, newPhoto])
          toast.success('Photo uploaded successfully')
          onClose()
        }

        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error uploading photo:', error)
        toast.error('Failed to upload photo')
      } finally {
        setIsLoading(false)
      }
    }
  })

  const handleExistingPhotoSelect = (url: string) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== url))
    } else {
      setSelectedPhotos([...selectedPhotos, url])
    }
  }

  const handleAddSelected = async () => {
    if (selectedPhotos.length === 0) return

    setIsLoading(true)
    try {
      const selectedPhotoObjects = existingPhotos.filter((photo) =>
        selectedPhotos.includes(photo.url)
      )

      const response = await fetch('/api/update-photo-collection', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          photos: selectedPhotoObjects
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update photo collection')
      }

      const updatedUser = await response.json()
      onUpdatePhotos(updatedUser.photoCollection)
      toast.success('Photos added to collection')
      onClose()
    } catch (error) {
      console.error('Error updating photo collection:', error)
      toast.error('Failed to update photo collection')
    } finally {
      setIsLoading(false)
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
          <div className="fixed inset-0 bg-black/40" />
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
                    Add Photos
                  </h2>
                  <button
                    onClick={onClose}
                    className="absolute top-0 right-0 rounded-md p-1 hover:bg-slate-100"
                  >
                    <CrossWhite fill="#374151" />
                  </button>
                </div>

                <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <TabList className="mb-6 flex gap-x-4 border-b border-gray-200">
                    <Tab
                      className={({ selected }) =>
                        cn(
                          'relative pb-4 text-sm font-medium outline-none',
                          selected
                            ? 'text-sky-600'
                            : 'text-gray-500 hover:text-gray-700'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span>Upload New</span>
                          {selected && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-600" />
                          )}
                        </>
                      )}
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        cn(
                          'relative pb-4 text-sm font-medium outline-none',
                          selected
                            ? 'text-sky-600'
                            : 'text-gray-500 hover:text-gray-700'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span>From Existing</span>
                          {selected && (
                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-600" />
                          )}
                        </>
                      )}
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <div
                        {...getRootProps()}
                        className="cursor-pointer rounded-lg border-2 border-dashed border-sky-500 p-8 text-center transition hover:border-sky-600"
                      >
                        <input {...getInputProps()} />
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Uploading...</span>
                          </div>
                        ) : (
                          <p>Drag and drop a photo here, or click to select</p>
                        )}
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className="grid grid-cols-3 gap-4">
                        {existingPhotos.map((photo) => (
                          <div
                            key={photo.url}
                            className={cn(
                              'relative aspect-square cursor-pointer overflow-hidden rounded-lg',
                              'transition hover:ring-2 hover:ring-sky-500',
                              selectedPhotos.includes(photo.url) &&
                                'ring-2 ring-sky-500'
                            )}
                            onClick={() => handleExistingPhotoSelect(photo.url)}
                          >
                            <Image
                              src={photo.url}
                              alt="Existing photo"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleAddSelected}
                          disabled={selectedPhotos.length === 0 || isLoading}
                          className={cn(
                            'rounded-md px-4 py-2 text-sm font-medium',
                            selectedPhotos.length === 0 || isLoading
                              ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                              : 'bg-sky-500 text-white hover:bg-sky-600'
                          )}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            'Add Selected'
                          )}
                        </button>
                      </div>
                    </TabPanel>
                  </TabPanels>
                </TabGroup>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
