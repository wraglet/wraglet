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

/** Horizontal slot to the left of the chat floater (`right-3` / `sm:right-5`). */
export const mobileFabSecondaryRightClassName =
  'right-[4.75rem] sm:right-20' as const

/**
 * Unauthenticated marketing/auth layout backdrop — matches `(unauthenticated)/layout.tsx` `<main>`.
 */
export const unauthenticatedShellBackdropClassName =
  'bg-gradient-to-br from-[#eaf6fd] via-[#e3f1fa] to-[#b3e0fa]' as const
