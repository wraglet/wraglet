import SignUp from '@/components/auth/SignUp'

const RegisterPage = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto px-4 py-6">
        <h1 className="mb-2 text-center text-2xl font-semibold text-[#0EA5E9]">
          Create an account
        </h1>
        <p className="mb-4 text-center text-sm text-neutral-500">
          Sign up to join Wraglet
        </p>
        <SignUp />
      </div>
    </div>
  )
}

export default RegisterPage
