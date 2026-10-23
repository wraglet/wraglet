'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ReportPostModalProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or hate' },
  { value: 'explicit', label: 'Nudity or sexual content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' }
] as const

const ReportPostModal = ({ postId, isOpen, onClose }: ReportPostModalProps) => {
  const [reason, setReason] =
    useState<(typeof REASONS)[number]['value']>('spam')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await axios.post('/api/reports', {
        targetType: 'post',
        targetId: postId,
        reason,
        details: details.trim() || undefined
      })
      toast.success(
        'Report submitted. Thank you for helping keep Wraglet safe.'
      )
      onClose()
      setDetails('')
      setReason('spam')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error ?? 'Failed to submit report')
      } else {
        toast.error('Failed to submit report')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-post-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <h2
          id="report-post-title"
          className="text-lg font-semibold text-gray-900"
        >
          Report post
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us why this post violates our Community Guidelines.
        </p>

        <div className="mt-4 space-y-2">
          {REASONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
            >
              <input
                type="radio"
                name="report-reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
              />
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>

        <textarea
          className="mt-4 w-full rounded-md border border-gray-300 p-2 text-sm"
          rows={3}
          placeholder="Optional details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={1000}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportPostModal
