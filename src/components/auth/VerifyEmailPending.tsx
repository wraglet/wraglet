'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import {
  resendVerificationAction,
  type ResendVerificationState
} from '@/actions/resendVerification'
import toast from 'react-hot-toast'

import Button from '@/components/shared/Button'

type VerifyEmailPendingProps = {
  email?: string
}

const initialState: ResendVerificationState = {}

const VerifyEmailPending = ({ email }: VerifyEmailPendingProps) => {
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState
  )

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

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
      {email ? (
        <form action={formAction} className="w-full">
          <input type="hidden" name="email" value={email} />
          <Button
            type="submit"
            variant="outline"
            disabled={isPending || state.success}
            className="w-full rounded-xl border-[#0EA5E9] py-2.5 font-semibold text-[#0EA5E9] hover:bg-[#eaf6fd]"
          >
            {isPending && 'Sending...'}
            {!isPending && state.success && 'Link sent'}
            {!isPending && !state.success && 'Resend verification email'}
          </Button>
        </form>
      ) : null}
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
