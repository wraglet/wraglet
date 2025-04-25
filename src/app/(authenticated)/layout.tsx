import { redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getSession from '@/actions/getSession'

import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

const AuthenticatedLayout = async ({
  children
}: {
  children: React.ReactNode
}) => {
  const session = await getSession()
  const currentUser = await getCurrentUser()

  if (!session) {
    redirect('/')
  } else
    return (
      <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[rgba(110,201,247,0.15)]">
        <Header currentUser={currentUser} />
        {children}
      </div>
    )
}

export default AuthenticatedLayout
