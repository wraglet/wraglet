'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { photoCollectionItemSchema } from '@/contracts/shared'
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
import type { z } from 'zod'

import CrossWhite from '@/components/shared/CrossWhite'

type PhotoCollectionItem = z.infer<typeof photoCollectionItemSchema>

const modalBackdropClassName = 'fixed inset-0 bg-black bg-opacity-40'
const modalScrollContainerClassName = 'fixed inset-0 overflow-y-auto'
const modalCenterClassName = 'flex min-h-full items-center justify-center p-4'
const dialogPanelClassName =
  'max-h-[min(90dvh,100%)] w-full max-w-3xl transform overflow-y-auto rounded-2xl bg-white p-4 shadow-xl transition-all sm:p-6'
const closeButtonClassName =
  'absolute top-0 right-0 rounded-md p-1 hover:bg-slate-100'
const tabListClassName = 'mb-6 flex gap-x-4 border-b border-gray-200'
const tabIndicatorClassName = 'absolute bottom-0 left-0 h-0.5 w-full bg-sky-600'
const dropzoneClassName =
  'cursor-pointer rounded-lg border-2 border-dashed border-sky-500 p-8 text-center transition hover:border-sky-600'
const photoGridClassName = 'grid grid-cols-3 gap-4'
const photoImageClassName = 'object-cover'
const addSelectedRowClassName = 'mt-4 flex justify-end'

const getTabClassName = (selected: boolean) =>
  cn(
    'relative pb-4 text-sm font-medium outline-none',
    selected ? 'text-sky-600' : 'text-gray-500 hover:text-gray-700'
  )

const getPhotoButtonClassName = (isSelected: boolean) =>
  cn(
    'relative aspect-square cursor-pointer overflow-hidden rounded-lg border-0 p-0',
    'transition hover:ring-2 hover:ring-sky-500',
    'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none',
    isSelected && 'ring-2 ring-sky-500'
  )

const getAddSelectedButtonClassName = (isDisabled: boolean) =>
  cn(
    'rounded-md px-4 py-2 text-sm font-medium',
    isDisabled
      ? 'cursor-not-allowed bg-gray-200 text-gray-500'
      : 'bg-sky-500 text-white hover:bg-sky-600'
  )

interface AddPhotoModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly existingPhotos: PhotoCollectionItem[]
  readonly onUpdatePhotos: (photos: PhotoCollectionItem[]) => void
}

const AddPhotoModal = ({
  isOpen,
  onClose,
  existingPhotos,
  onUpdatePhotos
}: Readonly<AddPhotoModalProps>) => {
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

          const newPhoto = (await response.json()) as PhotoCollectionItem
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
    setSelectedPhotos((current) =>
      current.includes(url)
        ? current.filter((photoUrl) => photoUrl !== url)
        : [...current, url]
    )
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

      const updatedUser = (await response.json()) as {
        photoCollection: PhotoCollectionItem[]
      }
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

  const isAddSelectedDisabled = selectedPhotos.length === 0 || isLoading

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
          <div className={modalBackdropClassName} />
        </TransitionChild>

        <div className={modalScrollContainerClassName}>
          <div className={modalCenterClassName}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={dialogPanelClassName}>
                <div className="relative mb-6">
                  <h2 className="text-sm font-bold text-gray-900">
                    Add Photos
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close add photos dialog"
                    className={closeButtonClassName}
                  >
                    <CrossWhite fill="#374151" />
                  </button>
                </div>

                <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
                  <TabList className={tabListClassName}>
                    <Tab
                      className={({ selected }) => getTabClassName(selected)}
                    >
                      {({ selected }) => (
                        <>
                          <span>Upload New</span>
                          {selected ? (
                            <div className={tabIndicatorClassName} />
                          ) : null}
                        </>
                      )}
                    </Tab>
                    <Tab
                      className={({ selected }) => getTabClassName(selected)}
                    >
                      {({ selected }) => (
                        <>
                          <span>From Existing</span>
                          {selected ? (
                            <div className={tabIndicatorClassName} />
                          ) : null}
                        </>
                      )}
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <div {...getRootProps()} className={dropzoneClassName}>
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
                      <div className={photoGridClassName}>
                        {existingPhotos.map((photo) => (
                          <button
                            key={photo.url}
                            type="button"
                            className={getPhotoButtonClassName(
                              selectedPhotos.includes(photo.url)
                            )}
                            onClick={() => handleExistingPhotoSelect(photo.url)}
                          >
                            <Image
                              src={photo.url}
                              alt="Existing photo"
                              fill
                              sizes="(max-width: 768px) 33vw, 200px"
                              className={photoImageClassName}
                            />
                          </button>
                        ))}
                      </div>
                      <div className={addSelectedRowClassName}>
                        <button
                          type="button"
                          onClick={handleAddSelected}
                          disabled={isAddSelectedDisabled}
                          className={getAddSelectedButtonClassName(
                            isAddSelectedDisabled
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

export default AddPhotoModal
