'use client'

import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { passwordSchema } from '@/lib/auth/passwordSchema'
import { authFormInputClassName } from '@/lib/authFormInputClassName'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import { getValidationMessages } from '@/components/auth/password-validations'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type ResetFormData = z.infer<typeof resetSchema>

type ResetPasswordFormProps = {
  token: string
}

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter()
  const formMethods = useForm<ResetFormData>({
    mode: 'onChange',
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isValid }
  } = formMethods

  const newPassword = useWatch({ control, name: 'password' }) ?? ''

  const mutation = useMutation({
    mutationFn: async (data: ResetFormData) => {
      await axios.post('/api/auth/reset-password', {
        token,
        password: data.password
      })
    },
    onSuccess: () => {
      toast.success(
        'Password updated. Your email is verified — you can log in now.'
      )
      router.push('/')
    },
    onError: (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'Unable to reset password.'
      toast.error(message)
    }
  })

  const onSubmit = (data: ResetFormData) => {
    mutation.mutate(data)
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Input
          {...register('password')}
          placeholder="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          className={authFormInputClassName}
        />
        {getValidationMessages(newPassword) && (
          <ul className="mt-1 flex flex-col gap-y-1 text-sm">
            {getValidationMessages(newPassword)?.map((message) => (
              <li
                key={message}
                className={
                  message.startsWith('✔️') ? 'text-green-500' : 'text-red-500'
                }
              >
                {message}
              </li>
            ))}
          </ul>
        )}
        <Input
          {...register('confirmPassword')}
          placeholder="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          className={authFormInputClassName}
        />
        <Button
          type="submit"
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-2.5 text-base font-semibold text-white shadow-md transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isValid || mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Set new password'}
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

export default ResetPasswordForm
