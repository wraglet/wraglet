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

import {
  profileActionsClassName,
  profileAvatarBadgeClassName,
  profileAvatarBadgeIconClassName,
  profileAvatarClassName,
  profileAvatarWrapClassName,
  profileBioClassName,
  profileBioCountClassName,
  profileBioFooterClassName,
  profileCheckboxClassName,
  profileDisplayNameClassName,
  profileEditButtonClassName,
  profileErrorClassName,
  profileFieldGridClassName,
  profileFormCardClassName,
  profileFormClassName,
  profileInputClassName,
  profileLabelClassName,
  profileLabelOptionalClassName,
  profileLoadingInnerClassName,
  profileLoadingSpinnerClassName,
  profileLoadingTextClassName,
  profileLoadingWrapClassName,
  profileNameBlockClassName,
  profileNameLineClassName,
  profileOverviewCardClassName,
  profileOverviewRowClassName,
  profileOverviewUserRowClassName,
  profilePrivacyBoxClassName,
  profilePrivacyHintClassName,
  profilePrivacyLabelClassName,
  profilePrivacyRowClassName,
  profileSaveButtonClassName,
  profileSaveSpinnerClassName,
  profileSelectClassName,
  profileSettingsHeaderDescClassName,
  profileSettingsHeaderTitleClassName,
  profileSettingsPageClassName,
  profileTextareaClassName,
  profileUsernameClassName
} from '@/app/(authenticated)/settings/profile/profileSettingsClassNames'

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
      <div className={profileLoadingWrapClassName}>
        <div className={profileLoadingInnerClassName}>
          <div className={profileLoadingSpinnerClassName} />
          <p className={profileLoadingTextClassName}>Loading profile...</p>
        </div>
      </div>
    )
  }

  const profileUser: User = user

  return (
    <div className={profileSettingsPageClassName}>
      <div className="hidden lg:block">
        <h1 className={profileSettingsHeaderTitleClassName}>
          Profile Settings
        </h1>
        <p className={profileSettingsHeaderDescClassName}>
          Manage your personal information and preferences
        </p>
      </div>

      <div className={profileOverviewCardClassName}>
        <div className={profileOverviewRowClassName}>
          <div className={profileOverviewUserRowClassName}>
            <div className={profileAvatarWrapClassName}>
              <Avatar
                src={profileUser.profilePicture?.url || null}
                gender={profileUser.gender as Gender}
                alt={`${profileUser.firstName}'s Profile`}
                className={profileAvatarClassName}
              />
              <div className={profileAvatarBadgeClassName}>
                <UserIcon className={profileAvatarBadgeIconClassName} />
              </div>
            </div>
            <div className={profileNameBlockClassName}>
              <h2 className={profileDisplayNameClassName}>
                <span className={profileNameLineClassName}>
                  {profileUser.firstName} {profileUser.lastName}
                </span>
              </h2>
              <p className={profileUsernameClassName}>
                {formatDisplayUsername(profileUser.username)}
              </p>
              {profileUser.bio ? (
                <p className={profileBioClassName}>
                  &ldquo;{profileUser.bio}&rdquo;
                </p>
              ) : null}
            </div>
          </div>
          {isEditing ? null : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className={profileEditButtonClassName}
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className={profileFormCardClassName}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={profileFormClassName}
        >
          <div className={profileFieldGridClassName}>
            <div>
              <label htmlFor="firstName" className={profileLabelClassName}>
                First Name
              </label>
              <input
                id="firstName"
                disabled={!isEditing}
                className={profileInputClassName}
                placeholder="Enter your first name"
                {...form.register('firstName')}
              />
              {form.formState.errors.firstName ? (
                <p className={profileErrorClassName}>
                  {form.formState.errors.firstName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="lastName" className={profileLabelClassName}>
                Last Name
              </label>
              <input
                id="lastName"
                disabled={!isEditing}
                className={profileInputClassName}
                placeholder="Enter your last name"
                {...form.register('lastName')}
              />
              {form.formState.errors.lastName ? (
                <p className={profileErrorClassName}>
                  {form.formState.errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className={profileLabelClassName}>
              Bio{' '}
              <span className={profileLabelOptionalClassName}>(Optional)</span>
            </label>
            <textarea
              id="bio"
              disabled={!isEditing}
              rows={3}
              className={profileTextareaClassName}
              placeholder="Tell us about yourself..."
              maxLength={300}
              {...form.register('bio')}
            />
            <div className={profileBioFooterClassName}>
              {form.formState.errors.bio ? (
                <p className={profileErrorClassName}>
                  {form.formState.errors.bio.message}
                </p>
              ) : null}
              <span className={profileBioCountClassName}>{bioLength}/300</span>
            </div>
          </div>

          <div className={profileFieldGridClassName}>
            <div>
              <label htmlFor="gender" className={profileLabelClassName}>
                Gender
              </label>
              <select
                id="gender"
                disabled={!isEditing}
                className={profileSelectClassName}
                {...form.register('gender')}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
              {form.formState.errors.gender ? (
                <p className={profileErrorClassName}>
                  {form.formState.errors.gender.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="pronoun" className={profileLabelClassName}>
                Pronouns{' '}
                <span className={profileLabelOptionalClassName}>
                  (Optional)
                </span>
              </label>
              <select
                id="pronoun"
                disabled={!isEditing}
                className={profileSelectClassName}
                {...form.register('pronoun')}
              >
                <option value="">Select pronouns</option>
                <option value="She/Her">She/Her</option>
                <option value="He/Him">He/Him</option>
                <option value="They/Them">They/Them</option>
              </select>
              {form.formState.errors.pronoun ? (
                <p className={profileErrorClassName}>
                  {form.formState.errors.pronoun.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className={profilePrivacyBoxClassName}>
            <div className={profilePrivacyRowClassName}>
              <input
                id="publicProfileVisible"
                type="checkbox"
                disabled={!isEditing}
                className={profileCheckboxClassName}
                {...form.register('publicProfileVisible')}
              />
              <div>
                <label
                  htmlFor="publicProfileVisible"
                  className={profilePrivacyLabelClassName}
                >
                  Make profile public
                </label>
                <p className={profilePrivacyHintClassName}>
                  Allow others to view your profile and posts
                </p>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className={profileActionsClassName}>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={updateProfileMutation.isPending}
                className={profileSaveButtonClassName}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className={profileSaveSpinnerClassName} />
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
          ) : null}
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings
