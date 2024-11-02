import getCurrentUser from '@/actions/getCurrentUser'
import deJSONify from '@/utils/deJSONify'

import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

const AuthenticatedLayout = async ({
  children
}: {
  children: React.ReactNode
}) => {
  const jsonUser = await getCurrentUser().catch((err) => {
    console.error(
      'Error happened while getting getCurrentUser() on AuthenticatedLayout component: ',
      err
    )
  })

  const currentUser = deJSONify(jsonUser)

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[rgba(110,201,247,0.15)]">
      <Header currentUser={currentUser} />
      {children}
    </div>
  )
}

export default AuthenticatedLayout
