/**
 * Authenticated shell visuals — use in Storybook decorators (see `@/lib/storybookDecorators` for chat FAB column).
 * Tailwind must see full class strings here (JIT).
 */
export const appShellPageWashClassName = 'bg-[rgba(110,201,247,0.15)]' as const

export const appHeaderGradientClassName =
  'bg-gradient-to-r from-sky-500 via-[#0EA5E9] to-sky-600' as const

/**
 * Fixed `bottom` for FABs above `MobileBottomNav` (h-14 + safe-area on xs,
 * h-16 + safe-area on sm+). Keeps discover + chat stack aligned with the tab bar.
 */
export const mobileFabStackBottomClassName =
  'bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+0.5rem)] sm:bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)]' as const

/**
 * Feed center column: clearance for mobile FABs when `main` is already inset above the tab bar.
 * Desktop uses modest page padding only (no bottom tab bar).
 */
export const feedScrollContentPaddingBottomClassName =
  'max-lg:pb-14 sm:max-lg:pb-16 lg:pb-6' as const

/** `main` inset above `MobileBottomNav` (h-14, sm:h-16) — mobile only. */
export const mobileMainBottomInsetClassName =
  'max-lg:bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:max-lg:bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:bottom-0' as const

/** Full-bleed panel between header and mobile tab bar (messages, etc.). */
export const mobileFullHeightPanelClassName =
  'fixed top-14 right-0 left-0 z-0 flex min-h-0 flex-col bg-white max-lg:h-auto' as const

/**
 * Messages route slot inside the authenticated shell — flex fill below the fixed
 * header and above the mobile tab bar (no fixed positioning on the page itself).
 */
export const messagesPageSlotClassName = [
  'flex w-full min-h-0 flex-1 flex-col overflow-hidden',
  'pt-14',
  'max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]',
  'sm:max-lg:pb-[calc(4rem+env(safe-area-inset-bottom,0px))]'
].join(' ')

/** Messages page content — fills the slot above. */
export const messagesPageMainClassName =
  'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white' as const

/**
 * Feed fills the viewport below the header; sidebars stay fixed height, center scrolls.
 */
export const feedMainLayoutClassName =
  'fixed top-14 right-0 left-0 z-0 mx-auto flex w-full max-w-7xl items-stretch px-3 sm:px-4' as const

/**
 * Centered list pages (notifications, search): full-width scroll panel below the header.
 * Pair with `centeredListPageInnerClassName` on a `w-full` child so layout `items-center` does not shrink content.
 */
export const centeredListPageMainClassName = [
  'fixed top-14 right-0 left-0 z-0 w-full overflow-y-auto overscroll-y-contain bg-white',
  mobileMainBottomInsetClassName,
  feedScrollContentPaddingBottomClassName
].join(' ')

/**
 * Inner column for notifications/search — width matches feed post column; padding matches
 * `Post` / `FeedBlogCard` (`px-3 py-3 sm:px-4 sm:py-4`).
 */
export const centeredListPageInnerClassName =
  'mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4' as const

/** Card shell aligned with feed post cards (`border-neutral-200`, compact, no min-height stretch). */
export const centeredListPageCardClassName =
  'flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white drop-shadow-md' as const

export const centeredListPageCardHeaderClassName =
  'border-b border-neutral-200 px-3 py-2.5 sm:px-4 sm:py-3' as const

/** Page / panel title — same scale as feed author line (`text-sm font-bold`). */
export const centeredListPageTitleClassName =
  'text-sm font-bold leading-none text-gray-900' as const

export const centeredListPageSectionTitleClassName =
  'text-sm font-bold leading-none text-gray-900' as const

export const centeredListPageSubtitleClassName =
  'text-xs leading-none text-zinc-500' as const

export const centeredListPageBadgeClassName =
  'rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600' as const

export const centeredListPageSectionClassName = 'space-y-3' as const

export const centeredListPageListItemClassName =
  'flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-gray-50 sm:px-4 sm:py-3' as const

export const centeredListPageRowClassName =
  'flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-gray-50 sm:px-4 sm:py-3' as const

export const centeredListPageBodyTextClassName =
  'text-sm leading-snug text-gray-900' as const

export const centeredListPageSecondaryTextClassName =
  'line-clamp-2 text-xs leading-relaxed text-gray-600' as const

export const centeredListPageBodyTextUnreadClassName =
  'text-sm leading-snug font-bold text-gray-900' as const

export const centeredListPageMetaClassName =
  'mt-0.5 text-xs leading-none text-zinc-500' as const

export const centeredListPageSectionHeaderClassName =
  'border-b border-neutral-200 bg-gray-50 px-3 py-2 sm:px-4' as const

export const centeredListPageEmptyStateClassName =
  'flex flex-col items-center justify-center px-3 py-10 text-center sm:px-4' as const

export const centeredListPageEmptyIconClassName =
  'mx-auto mb-3 h-10 w-10 text-gray-300' as const

export const centeredListPageEmptyTitleClassName =
  'mb-1 text-sm font-bold text-gray-900' as const

export const centeredListPageEmptyBodyClassName =
  'text-xs leading-relaxed text-gray-600' as const

export const centeredListPageFooterClassName =
  'border-t border-neutral-200 px-3 py-2.5 sm:px-4 sm:py-3' as const

/** In-app page title (settings, section headers) — feed author scale. */
export const authenticatedPageHeadingClassName = centeredListPageTitleClassName

export const authenticatedPageDescriptionClassName =
  'mt-1 text-xs leading-relaxed text-gray-600' as const

export const authenticatedSectionHeadingClassName =
  centeredListPageSectionTitleClassName

export const authenticatedFormCardClassName =
  'rounded-lg border border-neutral-200 bg-white p-3 shadow-sm drop-shadow-md sm:p-4' as const

export const authenticatedSettingsShellClassName =
  'mx-auto flex w-full max-w-5xl items-start gap-3 px-3 pt-14 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:gap-4 sm:px-4 lg:pb-6 xl:w-[1100px]' as const

export const authenticatedBackLinkClassName =
  'inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-sky-600' as const

export const authenticatedProfileMainClassName =
  'relative flex w-full flex-col items-center gap-y-3 overflow-hidden pb-[max(3.5rem,calc(4rem+env(safe-area-inset-bottom,0px)))] sm:gap-y-4 lg:pb-6' as const

/** Merge optional Tailwind classes without `cn()` in JSX (Sonar-friendly). */
export const mergeClassNames = (base: string, extra?: string): string =>
  extra ? `${base} ${extra}` : base

export const isAuthenticatedCenteredScrollPath = (pathname: string): boolean =>
  pathname === '/notifications' ||
  pathname.startsWith('/search') ||
  pathname.startsWith('/post/')

/** Horizontal slot to the left of the chat floater (`right-3` / `sm:right-5`). */
export const mobileFabSecondaryRightClassName =
  'right-[4.75rem] sm:right-20' as const

/**
 * Unauthenticated marketing/auth layout backdrop — matches `(unauthenticated)/layout.tsx` `<main>`.
 */
export const unauthenticatedShellBackdropClassName =
  'bg-gradient-to-br from-[#eaf6fd] via-[#e3f1fa] to-[#b3e0fa]' as const
