import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="mb-1 flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-semibold text-[#0EA5E9]">
          Forgot password
        </h1>
        <p className="text-center text-sm text-neutral-500">
          Enter your email and we will send a reset link if an account exists.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}

export default ForgotPasswordPage
