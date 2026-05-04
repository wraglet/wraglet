/** Panel shell for header messages/notifications: fixed + inset on small viewports, anchored on md+. */
export const headerFlyoutPanelClassName =
  'fixed left-2 right-2 top-[calc(3.5rem+0.5rem)] z-[100] flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden rounded-xl border border-sky-100/80 bg-white shadow-xl shadow-sky-900/10 md:absolute md:top-full md:right-0 md:left-auto md:mt-2 md:max-h-none md:w-80'

export const headerFlyoutNotificationsListClassName =
  'min-h-0 flex-1 overflow-y-auto md:max-h-80 md:flex-none'

export const headerFlyoutMessagesListClassName =
  'min-h-0 flex-1 overflow-y-auto md:max-h-64 md:flex-none'
