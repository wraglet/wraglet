'use client'

import { useRef, useState } from 'react'
import {
  ACCEPTED_VIDEO_ACCEPT_ATTR,
  isAcceptedVideoContentType
} from '@/lib/media/videoContentTypes'
import toast from 'react-hot-toast'

const MAX_DURATION_SEC = 600

interface UploadPostVideoProps {
  show: boolean
  close: () => void
  caption?: string
}

const UploadPostVideo = ({
  show,
  close,
  caption = ''
}: UploadPostVideoProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  if (!show) {
    return null
  }

  const uploadFile = async (file: File) => {
    const contentType = file.type || 'video/mp4'
    if (!isAcceptedVideoContentType(contentType)) {
      throw new Error('Only MP4 or MOV videos are supported')
    }

    const video = document.createElement('video')
    video.preload = 'metadata'

    const durationSec = await new Promise<number>((resolve, reject) => {
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => reject(new Error('Unable to read video metadata'))
      video.src = URL.createObjectURL(file)
    })

    if (durationSec > MAX_DURATION_SEC) {
      throw new Error('Video must be 10 minutes or less')
    }

    const sessionRes = await fetch('/api/posts/video/upload-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileSize: file.size,
        contentType,
        durationSec,
        text: caption.trim() || undefined
      })
    })

    if (!sessionRes.ok) {
      const err = await sessionRes.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to start video upload')
    }

    const session = await sessionRes.json()
    const parts: Array<{ ETag: string; PartNumber: number }> = []

    for (let partNumber = 1; partNumber <= session.partCount; partNumber += 1) {
      const start = (partNumber - 1) * session.partSize
      const end = Math.min(start + session.partSize, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('postId', session.postId)
      formData.append('key', session.key)
      formData.append('uploadId', session.uploadId)
      formData.append('partNumber', String(partNumber))
      formData.append('chunk', chunk, `part-${partNumber}`)

      const uploadRes = await fetch('/api/posts/video/upload-part', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}))
        throw new Error(err.error ?? `Failed to upload part ${partNumber}`)
      }

      const { etag } = await uploadRes.json()
      if (!etag) {
        throw new Error(`Missing ETag for part ${partNumber}`)
      }

      parts.push({ ETag: etag.replaceAll('"', ''), PartNumber: partNumber })
    }

    const completeRes = await fetch('/api/posts/video/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: session.postId,
        key: session.key,
        uploadId: session.uploadId,
        parts,
        durationSec
      })
    })

    if (!completeRes.ok) {
      const err = await completeRes.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to finalize video upload')
    }
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedName(file.name)
    setIsUploading(true)

    try {
      await uploadFile(file)
      toast.success('Processing your video…')
      close()
      setSelectedName(null)
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload video'
      )
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-video-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2
          id="upload-video-title"
          className="text-lg font-semibold text-gray-900"
        >
          Upload video
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          MP4 or MOV up to 10 minutes. Your video will appear after processing.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_VIDEO_ACCEPT_ATTR}
          className="mt-4 block w-full text-sm"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {selectedName ? (
          <p className="mt-2 text-xs text-gray-500">{selectedName}</p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={close}
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>

        {isUploading ? (
          <p className="mt-3 text-sm text-sky-600">Uploading…</p>
        ) : null}
      </div>
    </div>
  )
}

export default UploadPostVideo
