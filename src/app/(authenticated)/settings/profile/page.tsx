'use client'

import Image from 'next/image'
import { useForm } from 'react-hook-form'

const user = {
  avatar: '/default-avatar.png',
  displayName: 'Ashlynn Milton',
  bio: 'I am a girl gamer!'
}

const ProfileSettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio
    }
  })

  const onSubmit = (data: any) => {
    // TODO: Save profile changes
    alert('Profile updated!')
  }

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-6 text-2xl font-bold">Profile Settings</h2>
      <div className="mb-6 flex items-center gap-4">
        <Image
          src={user.avatar}
          alt="Avatar"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <div className="font-semibold">{user.displayName}</div>
          <div className="text-sm text-gray-500">{user.bio}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium" htmlFor="displayName">
            Display Name
          </label>
          <input
            id="displayName"
            {...register('displayName')}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}

export default ProfileSettings
