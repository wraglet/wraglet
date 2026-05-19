'use client'

import { useEffect, useState } from 'react'
import type { Gender } from '@/interfaces'
import useUserStore from '@/store/user'
import type { User } from '@/store/user'
import { formatDisplayUsername } from '@/utils/displayFormat'
import { CheckIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  gender: z.enum(['Male', 'Female', 'Others'], {
    required_error: 'Please select a gender'
  }),
  pronoun: z
    .enum(['', 'She/Her', 'He/Him', 'They/Them'], {
      required_error: 'Please select pronouns'
    })
    .optional(),
  publicProfileVisible: z.boolean()
})

type ProfileFormData = z.infer<typeof profileSchema>

const ProfileSettings = () => {
  const { user, setUser } = useUserStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      bio: '',
      gender: 'Male',
      pronoun: '',
      publicProfileVisible: true
    }
  })

  const bioLength = (useWatch({ control: form.control, name: 'bio' }) ?? '')
    .length

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        gender: (user.gender as 'Male' | 'Female' | 'Others') || 'Male',
        pronoun:
          (user.pronoun as '' | 'She/Her' | 'He/Him' | 'They/Them') || '',
        publicProfileVisible: user.publicProfileVisible ?? true
      })
    }
  }, [user, form])

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await axios.patch('/api/users', data)
      return response.data
    },
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({
        queryKey: ['profileUser', user?.username]
      })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error: unknown) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : 'Failed to update profile'
      toast.error(message)
    }
  })

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sky-100 border-t-[#0EA5E9]"></div>
          <p className="mt-3 text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const profileUser: User = user

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Header */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <Avatar
                src={profileUser.profilePicture?.url || null}
                gender={profileUser.gender as Gender}
                alt={`${profileUser.firstName}'s Profile`}
                className="h-12 w-12 ring-2 ring-sky-100 sm:h-14 sm:w-14"
              />
              <div className="absolute -right-1 -bottom-1 rounded-full bg-[#0EA5E9] p-1 sm:p-1.5">
                <UserIcon className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                <span className="line-clamp-2 break-words sm:line-clamp-1">
                  {profileUser.firstName} {profileUser.lastName}
                </span>
              </h2>
              <p className="truncate text-xs text-gray-500 sm:text-sm">
                {formatDisplayUsername(profileUser.username)}
              </p>
              {profileUser.bio && (
                <p className="mt-1 line-clamp-2 text-xs text-gray-600 italic">
                  &ldquo;{profileUser.bio}&rdquo;
                </p>
              )}
            </div>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 w-full shrink-0 gap-1.5 sm:h-8 sm:w-auto"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="text-xs font-semibold text-gray-700"
              >
                First Name
              </label>
              <input
                id="firstName"
                {...form.register('firstName')}
                disabled={!isEditing}
                className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your first name"
              />
              {form.formState.errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="text-xs font-semibold text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                {...form.register('lastName')}
                disabled={!isEditing}
                className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your last name"
              />
              {form.formState.errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label
              htmlFor="bio"
              className="text-xs font-semibold text-gray-700"
            >
              Bio{' '}
              <span className="ml-1 font-medium text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="bio"
              {...form.register('bio')}
              disabled={!isEditing}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <div className="flex justify-between">
              {form.formState.errors.bio && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.bio.message}
                </p>
              )}
              <span className="text-xs text-gray-500">{bioLength}/300</span>
            </div>
          </div>

          {/* Gender and Pronoun Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="gender"
                className="text-xs font-semibold text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                {...form.register('gender')}
                disabled={!isEditing}
                className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
              {form.formState.errors.gender && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pronoun"
                className="text-xs font-semibold text-gray-700"
              >
                Pronouns{' '}
                <span className="ml-1 font-medium text-gray-500">
                  (Optional)
                </span>
              </label>
              <select
                id="pronoun"
                {...form.register('pronoun')}
                disabled={!isEditing}
                className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-[#0EA5E9] focus:ring-2 focus:ring-sky-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select pronouns</option>
                <option value="She/Her">She/Her</option>
                <option value="He/Him">He/Him</option>
                <option value="They/Them">They/Them</option>
              </select>
              {form.formState.errors.pronoun && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.pronoun.message}
                </p>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="rounded-lg border border-neutral-100 bg-gray-50 px-3 py-2.5">
            <div className="flex items-center space-x-3">
              <input
                id="publicProfileVisible"
                type="checkbox"
                {...form.register('publicProfileVisible')}
                disabled={!isEditing}
                className="h-3.5 w-3.5 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9] disabled:opacity-50"
              />
              <div>
                <label
                  htmlFor="publicProfileVisible"
                  className="text-sm font-semibold text-gray-700"
                >
                  Make profile public
                </label>
                <p className="text-xs text-gray-500">
                  Allow others to view your profile and posts
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={updateProfileMutation.isPending}
                className="gap-1.5"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings
