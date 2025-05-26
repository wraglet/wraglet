'use client'

import { FC } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import Button from '@/components/Button'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  buttonIcon?: React.ReactNode
}

const LoginForm: FC<LoginFormProps> = ({ buttonIcon }) => {
  const { push } = useRouter()
  const formMethods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const {
    handleSubmit,
    formState: { errors, isValid }
  } = formMethods

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await signIn('credentials', {
        email: data.email.toLowerCase(),
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
    onError: (error) => {
      console.error('Error during login:', error)
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
        className="flex w-full flex-col gap-6"
      >
        <Input
          {...formMethods.register('email')}
          placeholder="Email"
          type="email"
          autoFocus
          error={errors.email?.message}
          aria-label="Email"
          className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
        />
        <Input
          {...formMethods.register('password')}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          aria-label="Password"
          className="relative w-full cursor-default appearance-none rounded-lg border border-neutral-200 bg-white py-2 pr-10 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
        />
        <div className="mt-1 mb-2 flex w-full items-center justify-between">
          <button
            type="button"
            className="text-xs text-[#0EA5E9] transition-colors hover:underline focus:underline"
            tabIndex={0}
            aria-label="Forgot Password?"
            onClick={() => toast('Password reset coming soon!')}
          >
            Forgot Password?
          </button>
        </div>
        <Button
          type="submit"
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] py-3 text-base font-semibold text-white shadow-md transition-all hover:from-[#0EA5E9] hover:to-[#42BBFF] focus:ring-2 focus:ring-[#0EA5E9]"
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
