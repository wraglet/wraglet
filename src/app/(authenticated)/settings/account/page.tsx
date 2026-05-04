'use client'

import { useEffect, useState } from 'react'
import useUserStore from '@/store/user'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'

interface AccountFormData {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const passwordFieldClass =
  'h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none'

const AccountSettings = () => {
  const { user } = useUserStore()
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<AccountFormData>({
    defaultValues: {
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    reset({
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }, [user?.email, reset])

  const onSubmit = async (data: AccountFormData) => {
    if (!data.currentPassword && !data.newPassword && !data.confirmPassword) {
      toast.error('Enter your current and new password to make a change.')
      return
    }

    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      toast.error('Complete all password fields.')
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'validate',
        message: 'Passwords do not match'
      })
      return
    }

    setIsSaving(true)
    try {
      await axios.patch('/api/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })

      toast.success('Password updated.')
      reset({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to update password.')
      } else {
        toast.error('Failed to update password.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage sign-in details for your Wraglet account.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <div>
          <label
            className="mb-1 block text-xs font-semibold text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            readOnly
            placeholder="No email on file"
            className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            This is the email used when you registered.
          </p>
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-semibold text-gray-700"
            htmlFor="currentPassword"
          >
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={passwordFieldClass}
            {...register('currentPassword')}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-semibold text-gray-700"
            htmlFor="newPassword"
          >
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className={passwordFieldClass}
            {...register('newPassword')}
          />
        </div>
        <div>
          <label
            className="mb-1 block text-xs font-semibold text-gray-700"
            htmlFor="confirmPassword"
          >
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={passwordFieldClass}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword?.message && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Use at least 8 characters with uppercase, lowercase, number, and
          special character.
        </p>
        <Button type="submit" variant="default" size="sm" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}

export default AccountSettings
