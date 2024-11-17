'use client'

import React, { FC, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import Button from '@/components/Button'
import Modal from '@/components/Modal'
import SignUp from '@/components/SignUp'
import { Input } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginForm: FC = () => {
  const [isOpenSignUpModal, setIsOpenSignUpModal] = useState(false)
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
    <>
      <Modal
        onClose={() => formMethods.reset()}
        isOpen={isOpenSignUpModal}
        title="Create an account"
      >
        <SignUp />
      </Modal>
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-7 px-10 py-7 shadow-md"
        >
          <Input
            {...formMethods.register('email')}
            placeholder="Email"
            type="email"
            autoFocus
            error={errors.email?.message}
          />
          <div className="flex flex-col gap-1">
            <Input
              {...formMethods.register('password')}
              type="password"
              placeholder="Password"
              autoComplete="false"
              error={errors.password?.message}
            />
            <h4 className="ml-1 cursor-pointer text-xs font-medium text-[#1B87EA]">
              Forgot Password?
            </h4>
          </div>
          <Button
            type="submit"
            className="flex w-full items-center justify-center rounded bg-[#42BBFF] py-2 text-xs text-white"
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? 'Logging in...' : 'Login'}
          </Button>
          <p className="text-xs font-medium text-black">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="cursor-pointer text-[#1B87EA]"
              onClick={() => setIsOpenSignUpModal(true)}
            >
              Sign up!
            </button>
          </p>
        </form>
      </FormProvider>
    </>
  )
}

export default LoginForm
