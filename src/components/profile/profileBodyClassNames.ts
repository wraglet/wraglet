import {
  mobileFabSecondaryRightClassName,
  mobileFabStackBottomClassName
} from '@/lib/uiChrome'

export const profileBodyLayoutClassName =
  'tablet:px-5 mb-6 flex w-full items-start gap-x-10 lg:px-10 xl:w-[1250px] xl:px-0'

export const profileSidebarClassName =
  'tablet:flex tablet:w-2/5 hidden h-auto flex-col rounded-lg border border-solid border-neutral-200 bg-white drop-shadow-md'

export const profileMainColumnClassName =
  'tablet:grow flex w-full flex-col gap-y-4 sm:mx-10 md:mx-auto md:w-[680px]'

export const profileMobileFabClassName = [
  'tablet:hidden fixed z-40 flex h-11 w-11 items-center justify-center rounded-full',
  'bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 text-white',
  'shadow-[0_8px_28px_-8px_rgba(109,40,217,0.5)] ring-2 ring-white/40 transition',
  'hover:scale-105 hover:shadow-[0_12px_34px_-8px_rgba(109,40,217,0.6)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2',
  'active:scale-95 sm:h-12 sm:w-12 lg:hidden',
  mobileFabSecondaryRightClassName,
  mobileFabStackBottomClassName
].join(' ')

export const profileFabIconClassName = 'h-5 w-5 drop-shadow-sm'

export const profileMobileModalBackdropClassName =
  'tablet:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden'

export const profileMobileModalPanelClassName =
  'fixed inset-x-4 top-1/2 z-50 max-h-[80vh] -translate-y-1/2 overflow-hidden rounded-lg bg-white shadow-xl'

export const profileMobileModalHeaderClassName =
  'flex items-center justify-between border-b border-gray-200 p-4'

export const profileMobileModalTitleClassName =
  'text-sm font-bold text-gray-900'

export const profileMobileModalCloseClassName =
  'rounded-full p-2 transition-colors hover:bg-gray-100'

export const profileMobileModalBodyClassName = 'overflow-y-auto p-4'

export const profileMobileModalAchievementsClassName = 'mt-6'
