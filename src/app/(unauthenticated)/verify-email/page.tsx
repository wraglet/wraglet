import VerifyEmailPending from '@/components/auth/VerifyEmailPending'

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  const { email } = await searchParams
  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-6">
      <VerifyEmailPending email={email} />
    </div>
  )
}

export default VerifyEmailPage
