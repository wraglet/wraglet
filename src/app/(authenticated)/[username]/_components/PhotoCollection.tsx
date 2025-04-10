'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaPlus } from 'react-icons/fa6'

import AddPhotoModal from './AddPhotoModal'

interface PhotoCollectionProps {
  photos: {
    url: string
    type: 'post' | 'avatar'
    createdAt: string
  }[]
  existingPhotos: {
    url: string
    type: 'post' | 'avatar'
    createdAt: string
  }[]
  onUpdatePhotos: (
    photos: {
      url: string
      type: 'post' | 'avatar'
      createdAt: string
    }[]
  ) => void
}

const PhotoCollection = ({
  photos = [],
  existingPhotos = [],
  onUpdatePhotos
}: PhotoCollectionProps) => {
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const maxPhotos = 9

  const handlePhotoSelect = (selectedUrls: string[]) => {
    const newPhotos = [
      ...photos,
      ...selectedUrls.map((url) => {
        const existingPhoto = existingPhotos.find((photo) => photo.url === url)
        return (
          existingPhoto || {
            url,
            type: 'post' as const,
            createdAt: new Date().toISOString()
          }
        )
      })
    ].slice(0, maxPhotos)

    onUpdatePhotos(newPhotos)
  }

  return (
    <div className="flex h-full w-full flex-col gap-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Photo Collection
        </h2>
        <span className="text-sm font-medium text-gray-500">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative aspect-square w-full overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt={`Collection photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 bg-black transition-opacity duration-300"></div>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button
            onClick={() => setShowAddPhoto(true)}
            className="group relative aspect-square w-full rounded-lg border-2 border-dashed border-sky-300 bg-sky-50 transition-colors duration-300 hover:border-sky-400 hover:bg-sky-100"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2">
              <FaPlus className="text-2xl text-sky-400 transition-colors duration-300 group-hover:text-sky-500" />
              <span className="text-xs font-medium text-sky-600">
                Add Photo
              </span>
            </div>
          </button>
        )}
      </div>

      <AddPhotoModal
        show={showAddPhoto}
        onClose={() => setShowAddPhoto(false)}
        onSelect={handlePhotoSelect}
        existingPhotos={existingPhotos.filter(
          (photo) => !photos.some((p) => p.url === photo.url)
        )}
      />
    </div>
  )
}

export default PhotoCollection
