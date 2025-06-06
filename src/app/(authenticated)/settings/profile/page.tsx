'use client'

import { useEffect, useState } from 'react'
import { UserInterface } from '@/interfaces'
import useUserStore from '@/store/user'
import { CheckIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

import Avatar from '@/components/Avatar'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  gender: z.enum(['Male', 'Female', 'Other'], {
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

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      const typedUser = user as unknown as UserInterface
      form.reset({
        firstName: typedUser.firstName || '',
        lastName: typedUser.lastName || '',
        bio: typedUser.bio || '',
        gender: (typedUser.gender as 'Male' | 'Female' | 'Other') || 'Male',
        pronoun:
          (typedUser.pronoun as '' | 'She/Her' | 'He/Him' | 'They/Them') || '',
        publicProfileVisible: typedUser.publicProfileVisible ?? true
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
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile')
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const typedUser = user as unknown as UserInterface

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={typedUser.profilePicture?.url || null}
              gender={typedUser.gender}
              alt={`${typedUser.firstName}'s Profile`}
              className="h-20 w-20 ring-4 ring-blue-100"
            />
            <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-600 p-2">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {typedUser.firstName} {typedUser.lastName}
            </h2>
            <p className="text-gray-600">@{typedUser.username}</p>
            {typedUser.bio && (
              <p className="mt-2 text-sm text-gray-700 italic">
                &ldquo;{typedUser.bio}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                {...form.register('firstName')}
                disabled={!isEditing}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your first name"
              />
              {form.formState.errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                {...form.register('lastName')}
                disabled={!isEditing}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
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
            <label className="text-sm font-medium text-gray-700">
              Bio
              <span className="ml-1 text-xs text-gray-500">(Optional)</span>
            </label>
            <textarea
              {...form.register('bio')}
              disabled={!isEditing}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
            <div className="flex justify-between">
              {form.formState.errors.bio && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.bio.message}
                </p>
              )}
              <span className="text-xs text-gray-500">
                {form.watch('bio')?.length || 0}/300
              </span>
            </div>
          </div>

          {/* Gender and Pronoun Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                {...form.register('gender')}
                disabled={!isEditing}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {form.formState.errors.gender && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Pronouns
                <span className="ml-1 text-xs text-gray-500">(Optional)</span>
              </label>
              <select
                {...form.register('pronoun')}
                disabled={!isEditing}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
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
          <div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...form.register('publicProfileVisible')}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
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
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings
