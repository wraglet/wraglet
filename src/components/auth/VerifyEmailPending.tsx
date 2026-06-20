'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

import Button from '@/components/shared/Button'

type VerifyEmailPendingProps = {
  email?: string
}

const VerifyEmailPending: FC<VerifyEmailPendingProps> = ({ email }) => {
  const [sent, setSent] = useState(false)

  const resend = useMutation({
    mutationFn: async () => {
      if (!email) return
      await axios.post('/api/auth/resend-verification', { email })
    },
    onSuccess: () => {
      setSent(true)
      toast.success(AUTH_FEEDBACK.resendVerification)
    },
    onError: () => {
      toast.error('Could not resend. Try again later.')
    }
  })

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="mb-1 flex w-full flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-[#0EA5E9]">
          Check your email
        </h1>
        <p className="text-sm text-neutral-500">
          We sent a verification link
          {email ? (
            <>
              {' '}
              to <span className="font-medium">{email}</span>
            </>
          ) : (
            ' to your inbox'
          )}
          . Open it to confirm your email and access Wraglet.
        </p>
      </div>
      {email && (
        <Button
          type="button"
          variant="outline"
          disabled={resend.isPending || sent}
          onClick={() => resend.mutate()}
          className="w-full rounded-xl border-[#0EA5E9] py-2.5 font-semibold text-[#0EA5E9] hover:bg-[#eaf6fd]"
        >
          {resend.isPending && 'Sending...'}
          {!resend.isPending && sent && 'Link sent'}
          {!resend.isPending && !sent && 'Resend verification email'}
        </Button>
      )}
      <div className="mt-1 flex w-full justify-center">
        <Link
          href="/"
          className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}

export default VerifyEmailPending
