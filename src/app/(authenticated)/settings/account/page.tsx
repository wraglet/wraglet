'use client'

import { useForm } from 'react-hook-form'

const user = {
  email: 'ashlynn@example.com'
}

const AccountSettings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: user.email,
      password: ''
    }
  })

  const onSubmit = (data: any) => {
    // TODO: Save account changes
    alert('Account updated!')
  }

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-6 text-2xl font-bold">Account Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block font-medium" htmlFor="password">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full rounded border px-3 py-2"
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

export default AccountSettings
