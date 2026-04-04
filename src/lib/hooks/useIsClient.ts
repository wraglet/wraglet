import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/** SSR-safe client mount flag without setState-in-effect. */
export const useIsClient = () =>
  useSyncExternalStore(emptySubscribe, () => true, () => false)
