import { redirect } from 'next/navigation'
import getCurrentUser from '@/actions/getCurrentUser'
import getSession from '@/actions/getSession'
import { signOut } from '@/auth'
import { canUserSignIn, needsEmailVerification } from '@/lib/auth/accountAccess'

import AuthenticatedLayoutClientWrapper from '@/components/layout/AuthenticatedLayoutClientWrapper'

export const dynamic = 'force-dynamic'

const AuthenticatedLayout = async ({
  children
}: {
  children: React.ReactNode
}) => {
  const session = await getSession()
  const currentUser = await getCurrentUser()

  if (!session || !currentUser) {
    redirect('/')
  }

  if (!canUserSignIn(currentUser)) {
    if (needsEmailVerification(currentUser)) {
      redirect(`/verify-email?email=${encodeURIComponent(currentUser.email)}`)
    }
    await signOut({ redirectTo: '/?error=account_suspended' })
  }

  return (
    <AuthenticatedLayoutClientWrapper currentUser={currentUser}>
      {children}
    </AuthenticatedLayoutClientWrapper>
  )
}

export default AuthenticatedLayout
