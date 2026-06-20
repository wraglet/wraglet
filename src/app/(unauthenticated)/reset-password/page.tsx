import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center gap-4 p-6">
        <div className="mb-1 flex w-full flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold text-[#0EA5E9]">
            Invalid reset link
          </h1>
          <p className="text-sm text-neutral-500">
            Request a new password reset from the login page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="mb-1 flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-semibold text-[#0EA5E9]">
          Set a new password
        </h1>
        <p className="text-center text-sm text-neutral-500">
          Choose a strong password for your account.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  )
}

export default ResetPasswordPage
