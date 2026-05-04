'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Image from 'next/image'
import {
  ClipboardDocumentIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import { MAX_FILE_SIZE } from '@/data/constants'

interface BlogImageUploadProps {
  value?: File | string
  onChange: (fileOrUrl: File | string | undefined) => void
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
  const [imgError, setImgError] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    typeof value === 'string' ? value : undefined
  )

  // Generate preview URL for File (object URL lifecycle)
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      startTransition(() => setPreviewUrl(url))
      return () => URL.revokeObjectURL(url)
    }
    startTransition(() => {
      if (typeof value === 'string') setPreviewUrl(value)
      else setPreviewUrl(undefined)
    })
    return undefined
  }, [value])

  // Handle file selection
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      const file = files[0]
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds the 4MB limit.')
        return
      }
      if (!acceptedTypes.includes(file.type)) {
        toast.error(
          'Please select a valid image file (JPEG, PNG, GIF, or WebP).'
        )
        return
      }
      setImgError(false)
      onChange(file)
    },
    [acceptedTypes, onChange]
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

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setImgError(false)
  }

  useEffect(() => {
    startTransition(() => setImgError(false))
  }, [previewUrl])

  return (
    <div className={className}>
      {typeof value === 'string' &&
        value.trim() !== '' &&
        showPreview &&
        !imgError && (
          <div className="group relative">
            <Image
              src={value}
              alt="Uploaded image"
              width={400}
              height={200}
              className="h-auto w-full object-cover"
              unoptimized
              onError={() => setImgError(true)}
            />
            {/* Remove button overlay */}
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white opacity-80 hover:bg-red-600"
              title="Remove image"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {/* Replace button below */}
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                {isUploading ? 'Uploading...' : 'Replace image'}
              </button>
            </div>
          </div>
        )}
      {imgError && (
        <div className="flex h-[200px] w-full items-center justify-center bg-gray-100">
          <span className="text-xs text-red-500">
            Image failed to load. Please try another image.
          </span>
        </div>
      )}
      {!value && !imgError && (
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
            <div className="flex gap-2">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
              <ClipboardDocumentIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{placeholder}</p>
              <p className="mt-1 text-xs text-gray-500">
                Supports JPEG, PNG, GIF, WebP (max 4MB)
              </p>
              <p className="mt-1 text-xs text-blue-600">
                💡 Tip: You can paste images directly from your clipboard!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogImageUpload
