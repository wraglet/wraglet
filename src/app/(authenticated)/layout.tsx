import { redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getSession from '@/actions/getSession'

import AuthenticatedLayoutClientWrapper from '@/components/AuthenticatedLayoutClientWrapper'

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
      <div className="pb-16 lg:pb-0">
        <AuthenticatedLayoutClientWrapper currentUser={currentUser}>
          {children}
        </AuthenticatedLayoutClientWrapper>
      </div>
    )
}

export default AuthenticatedLayout
