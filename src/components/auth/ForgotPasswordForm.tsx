'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AUTH_FEEDBACK } from '@/lib/auth/authMessages'
import { authFormInputClassName } from '@/lib/authFormInputClassName'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import TurnstileWidget from '@/components/auth/TurnstileWidget'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'

const forgotSchema = z.object({
  email: z.string().email('Invalid email address')
})

type ForgotFormData = z.infer<typeof forgotSchema>

const ForgotPasswordForm: FC = () => {
  const router = useRouter()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const turnstileRequired = Boolean(siteKey)
  const turnstileComplete = !turnstileRequired || Boolean(turnstileToken)

  const formMethods = useForm<ForgotFormData>({
    mode: 'onChange',
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  })

  const {
    handleSubmit,
    register,
    formState: { errors, isValid }
  } = formMethods

  const mutation = useMutation({
    mutationFn: async (data: ForgotFormData) => {
      const response = await axios.post('/api/auth/forgot-password', {
        email: data.email.trim().toLowerCase(),
        turnstileToken
      })
      return response.data
    },
    onSuccess: () => {
      toast.success(AUTH_FEEDBACK.forgotPassword)
      router.push('/')
    },
    onError: (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'Something went wrong. Please try again.'
      toast.error(message)
    }
  })

  const onSubmit = (data: ForgotFormData) => {
    if (turnstileRequired && !turnstileToken) {
      toast.error('Complete the security check first.')
      return
    }
    mutation.mutate(data)
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Input
          {...register('email')}
          placeholder="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          className={authFormInputClassName}
        />
        <TurnstileWidget
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
        <Button
          type="submit"
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-2.5 text-base font-semibold text-white shadow-md transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isValid || mutation.isPending || !turnstileComplete}
        >
          {mutation.isPending ? 'Sending...' : 'Send reset link'}
        </Button>
        <div className="mt-1 flex w-full justify-center">
          <Link
            href="/"
            className="text-sm font-medium text-[#0EA5E9] transition-colors hover:underline focus:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </FormProvider>
  )
}

export default ForgotPasswordForm
