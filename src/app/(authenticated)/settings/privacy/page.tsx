'use client'

import { useForm } from 'react-hook-form'

const user = {
  profileVisible: true
}

const PrivacySettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      profileVisible: user.profileVisible
    }
  })

  const onSubmit = (data: any) => {
    // TODO: Save privacy settings
    alert('Privacy settings updated!')
  }

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-6 text-2xl font-bold">Privacy & Security</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            id="profileVisible"
            type="checkbox"
            {...register('profileVisible')}
          />
          <label htmlFor="profileVisible" className="font-medium">
            Show my profile publicly
          </label>
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
      <div className="mt-6">
        <button className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
          Manage Blocked Users
        </button>
      </div>
    </div>
  )
}

export default PrivacySettings
