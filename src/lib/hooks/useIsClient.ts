import { useSyncExternalStore } from 'react'
import {
  getClientMountSnapshot,
  getServerMountSnapshot,
  subscribeToClientMount
} from '@/lib/hooks/clientMountSync'

/** SSR-safe client mount flag without setState-in-effect. */
export const useIsClient = () =>
  useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot
  )
