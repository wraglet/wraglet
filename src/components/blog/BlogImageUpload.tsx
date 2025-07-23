'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ClipboardDocumentIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import { MAX_FILE_SIZE } from '@/data/constants'

interface BlogImageUploadProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
  acceptedTypes?: string[]
  uploadType?: 'cover' | 'content'
}

const BlogImageUpload = ({
  value,
  onChange,
  placeholder = 'Click to upload, drag & drop, or paste an image...',
  className = '',
  showPreview = true,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  uploadType = 'content'
}: BlogImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload to R2
  const uploadImageToR2 = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string

            const response = await fetch('/api/blogs/upload-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                image: base64Data,
                type: uploadType
              })
            })

            if (!response.ok) {
              throw new Error('Failed to upload image')
            }

            const data = await response.json()
            resolve(data.url)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    },
    [uploadType]
  )

  // Handle file selection
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      const file = files[0]

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds the 4MB limit.')
        return
      }

      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error(
          'Please select a valid image file (JPEG, PNG, GIF, or WebP).'
        )
        return
      }

      setIsUploading(true)
      try {
        const url = await uploadImageToR2(file)
        onChange(url)
        toast.success('Image uploaded successfully!')
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [acceptedTypes, onChange, uploadImageToR2]
  )

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  // Handle clipboard paste
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            await handleFileUpload([file])
          }
          break
        }
      }
    },
    [handleFileUpload]
  )

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  // Handle manual file input click
  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  // Handle manual file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  // Remove image
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className={className}>
      {value && showPreview ? (
        // Preview mode
        <div className="group relative">
          <div className="relative overflow-hidden rounded-lg border border-neutral-200">
            <Image
              src={value}
              alt="Uploaded image"
              width={400}
              height={200}
              className="h-auto w-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', value)
                onChange('') // Clear invalid image
              }}
            />
            <div className="bg-opacity-0 group-hover:bg-opacity-30 absolute inset-0 flex items-center justify-center bg-black transition-opacity">
              <button
                onClick={handleRemove}
                className="rounded-full bg-red-500 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                title="Remove image"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleClick}
              disabled={isUploading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isUploading ? 'Uploading...' : 'Replace image'}
            </button>
          </div>
        </div>
      ) : (
        // Upload mode
        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive || dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-neutral-300 bg-gray-50 hover:border-neutral-400'
          } ${isUploading ? 'cursor-not-allowed opacity-50' : ''} `}
          onClick={handleClick}
        >
          <input
            {...getInputProps()}
            ref={fileInputRef}
            onChange={handleFileInputChange}
            disabled={isUploading}
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <CloudArrowUpIcon className="h-8 w-8 animate-pulse text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Uploading...
                  </p>
                  <p className="text-xs text-gray-500">Please wait</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                  <ClipboardDocumentIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {placeholder}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports JPEG, PNG, GIF, WebP (max 4MB)
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    💡 Tip: You can paste images directly from your clipboard!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogImageUpload
