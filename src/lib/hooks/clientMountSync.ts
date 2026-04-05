/** External-store snapshots for `useIsClient` (exported for focused unit coverage). */
export const subscribeToClientMount = (): (() => void) => () => {}

export const getClientMountSnapshot = (): boolean => true

export const getServerMountSnapshot = (): boolean => false
