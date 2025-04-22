'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import getUserByUsername from '@/actions/getUserByUsername'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa6'

import AddPhotoModal from '@/app/(authenticated)/[username]/_components/AddPhotoModal'

interface PhotoData {
  url: string
  type: 'post' | 'avatar'
  createdAt?: string
}

interface Photo {
  url: string
  key: string
  type: 'post' | 'avatar'
  createdAt: string
}

interface PhotoForServer {
  url: string
  type: 'post' | 'avatar'
  createdAt: string
}

interface PhotoCollectionProps {
  username: string
}

const PhotoCollection = ({ username }: PhotoCollectionProps) => {
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const maxPhotos = 9

  const { data: userData, refetch } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => await getUserByUsername(username)
  })

  const updatePhotoCollection = useUserStore(
    useCallback((state) => state.updatePhotoCollection, [])
  )

  const { photoCollection = [] } = userData || {}
  const photos = photoCollection
    .filter((photo: PhotoData) => photo && photo.url)
    .map((photo: PhotoData) => ({
      url: photo.url,
      key: `${photo.type}-${photo.url}`,
      type: photo.type,
      createdAt: photo.createdAt?.toString() || new Date().toISOString()
    }))

  // Get existing photos including profile picture
  const existingPhotos: Photo[] = []
  if (userData) {
    // Add photoCollection photos
    photoCollection?.forEach((photo: PhotoData) => {
      if (photo && photo.url) {
        existingPhotos.push({
          url: photo.url,
          key: `${photo.type}-${photo.url}`,
          type: photo.type,
          createdAt: photo.createdAt?.toString() || new Date().toISOString()
        })
      }
    })

    // Add profile picture if it exists
    if (userData.profilePicture?.url) {
      existingPhotos.push({
        url: userData.profilePicture.url,
        key: `profile-${userData.profilePicture.url}`,
        type: 'avatar' as const,
        createdAt: userData.updatedAt?.toString() || new Date().toISOString()
      })
    }
  }

  const handleUpdatePhotos = async (newPhotos: Photo[]) => {
    try {
      // Combine existing photos with new photos
      const allPhotos = [...photos, ...newPhotos].map((photo) => ({
        url: photo.url,
        type: photo.type,
        createdAt: photo.createdAt?.toString() || new Date().toISOString()
      }))

      const response = await axios.patch('/api/update-photo-collection', {
        action: 'update',
        photos: allPhotos
      })

      if (response.status === 200) {
        const photosWithKeys = allPhotos.map((photo: PhotoForServer) => ({
          ...photo,
          key: `${photo.type}-${photo.url}`
        }))
        updatePhotoCollection(photosWithKeys)
        refetch()
        toast.success('Photo collection updated successfully')
        setShowAddPhoto(false)
      }
    } catch (error) {
      console.error('Error updating photo collection:', error)
      toast.error('Failed to update photo collection')
    }
  }

  console.log('photos: ', photos)

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
        {photos.map((photo: Photo) => (
          <div
            key={photo.key}
            className="group relative aspect-square w-full overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt={`Collection photo`}
              fill
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              priority
            />
          </div>
        ))}
        {userData?.isCurrentUser && photos.length < maxPhotos && (
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

      {userData?.isCurrentUser && (
        <AddPhotoModal
          isOpen={showAddPhoto}
          onClose={() => setShowAddPhoto(false)}
          onUpdatePhotos={handleUpdatePhotos}
          existingPhotos={existingPhotos.filter(
            (photo: Photo) => !photos.some((p: Photo) => p.url === photo.url)
          )}
        />
      )}
    </div>
  )
}

export default PhotoCollection
