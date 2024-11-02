import getCurrentUser from '@/actions/getCurrentUser'
import useUserStore from '@/store/user'
import deJSONify from '@/utils/deJSONify'

export const fetchUser = async () => {
  const jsonUser = await getCurrentUser()
  const user = deJSONify(jsonUser)

  const setUser = useUserStore.getState().setUser
  setUser(user)
}
