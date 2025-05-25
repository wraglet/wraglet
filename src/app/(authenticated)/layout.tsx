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
      <AuthenticatedLayoutClientWrapper currentUser={currentUser}>
        {children}
      </AuthenticatedLayoutClientWrapper>
    )
}

export default AuthenticatedLayout
