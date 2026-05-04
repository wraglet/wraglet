'use client'

import { FC } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authFormInputClassName } from '@/lib/authFormInputClassName'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  buttonIcon?: React.ReactNode
}

const LoginForm: FC<LoginFormProps> = ({ buttonIcon }) => {
  const { push } = useRouter()
  const formMethods = useForm<LoginFormData>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: ''
    }
  })

  const {
    handleSubmit,
    formState: { errors, isValid }
  } = formMethods

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const emailOrUsername = data.emailOrUsername.trim().toLowerCase()
      const response = await signIn('credentials', {
        email: emailOrUsername,
        password: data.password,
        redirect: false
      })

      if (response?.error) {
        throw new Error('Invalid credentials')
      }

      return response
    },
    onSuccess: () => {
      toast.success('Logged in!')
      push('/feed')
    },
    onError: () => {
      toast.error('Invalid credentials')
    }
  })

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data)
  }

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Input
          {...formMethods.register('emailOrUsername')}
          placeholder="Email or Username"
          type="text"
          autoFocus
          error={errors.emailOrUsername?.message}
          aria-label="Email or Username"
          className={authFormInputClassName}
        />
        <Input
          {...formMethods.register('password')}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          aria-label="Password"
          className={authFormInputClassName}
        />
        <div className="mt-1 mb-2 flex w-full items-center justify-between">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-[#0EA5E9] transition-colors hover:underline focus:underline"
            tabIndex={0}
            aria-label="Forgot Password?"
            onClick={() => toast('Password reset coming soon!')}
          >
            Forgot Password?
          </Button>
        </div>
        <Button
          type="submit"
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-2.5 text-base font-semibold text-white shadow-md transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isValid || mutation.isPending}
          aria-disabled={!isValid || mutation.isPending}
        >
          <span className="relative z-10 flex items-center justify-center">
            {mutation.isPending ? 'Logging in...' : 'Login'}
            {buttonIcon && (
              <span className="animate-bounce-once group-hover:animate-bounce-once ml-2">
                {buttonIcon}
              </span>
            )}
          </span>
          {/* Ripple effect */}
          <span className="group-active:animate-ripple pointer-events-none absolute inset-0 rounded-xl bg-white/20" />
        </Button>
      </form>
    </FormProvider>
  )
}

export default LoginForm
