'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import getUserByUsername from '@/actions/getUserByUsername'
import { photoCollectionItemSchema } from '@/contracts/shared'
import { authenticatedSectionHeadingClassName } from '@/lib/uiChrome'
import useUserStore from '@/store/user'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa6'
import type { z } from 'zod'

import AddPhotoModal from '@/components/profile/AddPhotoModal'
import {
  photoCollectionAddButtonClassName,
  photoCollectionAddButtonInnerClassName,
  photoCollectionAddIconClassName,
  photoCollectionAddLabelClassName,
  photoCollectionCountClassName,
  photoCollectionGridClassName,
  photoCollectionHeaderRowClassName,
  photoCollectionImageClassName,
  photoCollectionRootClassName,
  photoCollectionTileClassName
} from '@/components/profile/photoCollectionClassNames'

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

type PhotoCollectionItem = z.infer<typeof photoCollectionItemSchema>

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
    .filter((photo: PhotoData) => Boolean(photo.url))
    .map((photo: PhotoData) => ({
      url: photo.url,
      key: `${photo.type}-${photo.url}`,
      type: photo.type,
      createdAt: photo.createdAt?.toString() ?? new Date().toISOString()
    }))

  const existingPhotos: Photo[] = []
  if (userData) {
    photoCollection.forEach((photo: PhotoData) => {
      if (photo.url) {
        existingPhotos.push({
          url: photo.url,
          key: `${photo.type}-${photo.url}`,
          type: photo.type,
          createdAt: photo.createdAt?.toString() ?? new Date().toISOString()
        })
      }
    })

    if (userData.profilePicture?.url) {
      existingPhotos.push({
        url: userData.profilePicture.url,
        key: `profile-${userData.profilePicture.url}`,
        type: 'avatar' as const,
        createdAt: userData.updatedAt?.toString() ?? new Date().toISOString()
      })
    }
  }

  const handleUpdatePhotos = async (newPhotos: PhotoCollectionItem[]) => {
    try {
      const allPhotos = [...photos, ...newPhotos].map((photo) => ({
        url: photo.url,
        type: photo.type,
        createdAt: photo.createdAt?.toString() ?? new Date().toISOString()
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

  const showAddTile =
    Boolean(userData?.isCurrentUser) && photos.length < maxPhotos

  return (
    <div className={photoCollectionRootClassName}>
      <div className={photoCollectionHeaderRowClassName}>
        <h2 className={authenticatedSectionHeadingClassName}>
          Photo Collection
        </h2>
        <span className={photoCollectionCountClassName}>
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      <div className={photoCollectionGridClassName}>
        {photos.map((photo: Photo, photoIndex: number) => (
          <div key={photo.key} className={photoCollectionTileClassName}>
            <Image
              src={photo.url}
              alt="Collection photo"
              fill={true}
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              className={photoCollectionImageClassName}
              priority={photoIndex === 0}
            />
          </div>
        ))}
        {showAddTile ? (
          <button
            type="button"
            onClick={() => setShowAddPhoto(true)}
            className={photoCollectionAddButtonClassName}
          >
            <div className={photoCollectionAddButtonInnerClassName}>
              <FaPlus className={photoCollectionAddIconClassName} />
              <span className={photoCollectionAddLabelClassName}>
                Add Photo
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {userData?.isCurrentUser ? (
        <AddPhotoModal
          isOpen={showAddPhoto}
          onClose={() => setShowAddPhoto(false)}
          onUpdatePhotos={handleUpdatePhotos}
          existingPhotos={existingPhotos.filter(
            (photo: Photo) => !photos.some((p: Photo) => p.url === photo.url)
          )}
        />
      ) : null}
    </div>
  )
}

export default PhotoCollection
