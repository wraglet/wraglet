'use client'

import { useForm } from 'react-hook-form'

import Button from '@/components/shared/Button'

const user = {
  emailNotifications: true,
  pushNotifications: false
}

const NotificationsSettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications
    }
  })

  const onSubmit = () => {
    alert('Notification settings updated!')
  }

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose how Wraglet keeps you updated.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-gray-50 px-3 py-2.5">
          <input
            id="emailNotifications"
            type="checkbox"
            {...register('emailNotifications')}
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
          />
          <div>
            <label
              htmlFor="emailNotifications"
              className="text-sm font-semibold text-gray-700"
            >
              Email notifications
            </label>
            <p className="text-xs text-gray-500">
              Receive important account updates by email.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-gray-50 px-3 py-2.5">
          <input
            id="pushNotifications"
            type="checkbox"
            {...register('pushNotifications')}
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
          />
          <div>
            <label
              htmlFor="pushNotifications"
              className="text-sm font-semibold text-gray-700"
            >
              Push notifications
            </label>
            <p className="text-xs text-gray-500">
              Get real-time alerts for activity that matters.
            </p>
          </div>
        </div>
        <Button type="submit" variant="default" size="sm">
          Save Changes
        </Button>
      </form>
    </div>
  )
}

export default NotificationsSettings
