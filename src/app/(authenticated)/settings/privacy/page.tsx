'use client'

import { useForm } from 'react-hook-form'

import Button from '@/components/shared/Button'

const user = {
  profileVisible: true
}

const PrivacySettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      profileVisible: user.profileVisible
    }
  })

  const onSubmit = () => {
    alert('Privacy settings updated!')
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Privacy & Security
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Control who can see and interact with your profile.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-gray-50 px-3 py-2.5">
          <input
            id="profileVisible"
            type="checkbox"
            {...register('profileVisible')}
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
          />
          <div>
            <label
              htmlFor="profileVisible"
              className="text-sm font-semibold text-gray-700"
            >
              Show my profile publicly
            </label>
            <p className="text-xs text-gray-500">
              Allow others to view your profile and posts.
            </p>
          </div>
        </div>
        <Button type="submit" variant="default" size="sm">
          Save Changes
        </Button>
      </form>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <Button type="button" variant="outline" size="sm">
          Manage Blocked Users
        </Button>
      </div>
    </div>
  )
}

export default PrivacySettings
