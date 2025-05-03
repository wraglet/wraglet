'use client'

import { useForm } from 'react-hook-form'

const user = {
  emailNotifications: true,
  pushNotifications: false
}

const NotificationsSettings = () => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications
    }
  })

  const onSubmit = (data: any) => {
    // TODO: Save notification settings
    alert('Notification settings updated!')
  }

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-6 text-2xl font-bold">Notifications</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            id="emailNotifications"
            type="checkbox"
            {...register('emailNotifications')}
          />
          <label htmlFor="emailNotifications" className="font-medium">
            Email Notifications
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="pushNotifications"
            type="checkbox"
            {...register('pushNotifications')}
          />
          <label htmlFor="pushNotifications" className="font-medium">
            Push Notifications
          </label>
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

export default NotificationsSettings
