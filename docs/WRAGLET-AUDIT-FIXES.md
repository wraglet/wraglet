# Wraglet Audit — Targeted Files & Patterns to Fix

> **Last reviewed:** July 9, 2026  
> **Latest stable:** `react@19.2.7`, `next@16.2.10`  
> **Wraglet installed:** `react@19.2.4`, `next@16.2.2`  
> **Status:** Documentation only — no code changes applied yet.

Companion reference: [REACT-19-NEXT-16-UPDATES.md](./REACT-19-NEXT-16-UPDATES.md)

---

## Executive Summary

Wraglet is **already on React 19.2 and Next.js 16.2** and follows many modern patterns (App Router, Server Actions, Vitest, async `params`/`searchParams` on several pages, Ably via `ably/react`, flat ESLint config).

**Since the initial audit**, review against latest stable (`19.2.7` / `16.2.10`) shows:

- **No new APIs** in patch releases — same modernization targets apply.
- **Security advisories** in Next 16.2.5–16.2.6 (RSC DoS, cache poisoning, Image Optimization DoS, etc.) make a **version bump the new top priority**.
- **Server Action + FormData** is now safe on React ≥ 19.2.7 / Next ≥ 16.2.7 — unblocks the `useActionState` migration path (Wraglet does not use `<form action>` + FormData yet).
- **React 19.2 features still unused in codebase:** `<Activity>`, `useEffectEvent`, `useOptimistic`, `useActionState`, `cacheSignal`, View Transitions.

The highest-impact improvements remain **architectural**, plus staying current on patches:

1. **🔴 Upgrade to React 19.2.7 + Next 16.2.10** — security + Server Action stability (do not stop at 19.2.6 / 16.2.6).
2. **8 route `page.tsx` files are full Client Components** — they should be thin Server Component shells with client islands.
3. **`QueryClient` is recreated every render** in the root provider — a stability/performance bug.
4. **`forwardRef` remains in 6 shared UI primitives** — deprecated in React 19.
5. **No `"use cache"` / updated cache invalidation APIs** — acceptable given `force-dynamic`, but `revalidatePath`-only invalidation misses Next.js 16 cache primitives.
6. **Unused dependency `@ably-labs/react-hooks`** — superseded by `ably/react` (already used everywhere).
7. **Manual optimistic/pending state** in feed/profile/chat — prime candidates for `useOptimistic`, `useActionState`, and Server Actions (after version bump).

### Already Compliant ✅

| Area | Evidence |
|------|----------|
| Async route `params` / `searchParams` (several pages) | `post/[id]/page.tsx`, `blog/[slug]/page.tsx`, `verify-email`, `reset-password` |
| No sync `cookies()` / `headers()` in app code | Grep clean in `src/` |
| No Pages Router (`pages/`, `getServerSideProps`) | App Router only |
| No `unstable_cache`, `next/legacy/image`, `middleware.ts` | Not present |
| No `@ably-labs/react-hooks` imports | Package listed but unused; code uses `ably/react` |
| No `useFormState` (renamed hook) | Not used |
| No `react-test-renderer` | Vitest + RTL |
| Ably pattern mostly correct | `ChannelProvider` wrappers on feed, blog, profile, chat headers |
| Suspense on feed, blog, search, layout chrome | Present |
| ESLint via flat config (not `next lint`) | `eslint.config.mjs` |
| `useIsClient` uses `useSyncExternalStore` | Modern SSR-safe pattern (not deprecated) |
| React 19.2 APIs (`Activity`, `useEffectEvent`, etc.) | **None used yet** — see §New from latest stable below |

---

## New From Latest Stable (19.2.7 / 16.2.10) — Wraglet Impact

### What changed in patches (no new feature APIs)

Patch releases between Wraglet’s pinned versions and latest stable are **security + stability**, not new hooks. The original audit recommendations still stand.

### New audit items from latest stable

| Item | Priority | Detail |
|------|----------|--------|
| Bump `react` / `react-dom` to **19.2.7** | 🔴 P0 | Avoid 19.2.6 FormData regression; includes RSC hardening through 19.2.7 |
| Bump `next` / `eslint-config-next` to **16.2.10** | 🔴 P0 | 13 security advisories fixed in 16.2.5–16.2.6; FormData backport in 16.2.7 |
| Adopt `useActionState` + `<form action>` | 🟡 P2 *(unblocked)* | Safe only on ≥ 19.2.7 / ≥ 16.2.7; Wraglet currently uses RHF + axios + API routes |
| Use `cacheSignal` in cached server functions | 🟢 P3 | When `"use cache"` is enabled — detect cache lifetime end |
| Encode non-ASCII `cacheTag` values | 🟢 P3 | Fixed in Next 16.2.7 — relevant if tags include i18n strings |
| React Performance Tracks (DevTools) | 🟢 P3 | Profile before enabling React Compiler |

### React 19.2 features — codebase gap analysis

| API | Used in Wraglet? | Best Wraglet target |
|-----|------------------|---------------------|
| `useOptimistic` | ❌ | `Post.tsx`, `BlogReactionControls.tsx`, `FeedWithAbly.tsx` |
| `useActionState` | ❌ | `notifications/page.tsx` (mark read), auth resend/forgot forms |
| `useFormStatus` | ❌ | Submit buttons in forms migrated to Actions |
| `useEffectEvent` | ❌ | `AblyProvider.tsx`, `ChatWindow.tsx`, `Header.tsx` |
| `<Activity>` | ❌ | Blog modal on profile page, `ChatFloater.tsx`, `MobileDiscoverDrawer.tsx` |
| `use()` | ❌ | Conditional context reads (low priority vs `await` in SC) |
| `cacheSignal` | ❌ | Future `"use cache"` server functions |
| View Transitions | ❌ | Feed tab switches, settings navigation (optional polish) |

### Server Actions today vs recommended path

**Today:** `src/actions/*` are `'use server'` **data fetchers** called from client via `useEffect` or TanStack Query — not progressive-enhancement forms.

**After bump to 19.2.7+:** Migrate low-complexity mutations to native form Actions:

```tsx
// Example: mark notification read (future)
'use server'
export const markNotificationRead = async (formData: FormData) => {
  const id = formData.get('notificationId') as string
  await db.notifications.markRead(id)
  updateTag(`notifications-${userId}`)
}
```

```tsx
// Client
const [error, action, pending] = useActionState(markNotificationRead, null)
return (
  <form action={action}>
    <input type="hidden" name="notificationId" value={id} />
    <button disabled={pending}>Mark read</button>
  </form>
)
```

**Do not migrate on 19.2.6 / 16.2.6** — FormData entries were silently dropped.

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| 🔴 P0 | Bug or correctness issue — fix first |
| 🟠 P1 | Deprecated API or Next.js 16 mismatch — fix soon |
| 🟡 P2 | Architecture / performance improvement |
| 🟢 P3 | Optional modernization when touching related code |

---

## 🔴 P0 — Bugs, Security & Correctness

### 0. Upgrade to latest stable (React 19.2.7 + Next 16.2.10)

**Files:** `package.json`, `yarn.lock`

**Why now:**

- Next **16.2.5–16.2.6** address **13 security advisories** including RSC DoS ([GHSA-8h8q-6873-q5fj](https://github.com/vercel/next.js/security/advisories/GHSA-8h8q-6873-q5fj)), cache poisoning in RSC responses, Image Optimization DoS — all relevant to Wraglet (`next/image`, Server Components, API routes).
- React **19.2.6 → 19.2.7** fixes Server Action **FormData entries silently missing** — critical before any `useActionState` form work.
- Wraglet on **16.2.2** misses fixes through **16.2.7** (hydration from HTTP cache, non-ASCII cache tags, server-action rewrite loops).

**Fix:**

```bash
yarn add react@19.2.7 react-dom@19.2.7 next@16.2.10 eslint-config-next@16.2.10
yarn validate
```

**Do not pin 19.2.6 / 16.2.6** as a stopping point.

**Priority:** 🔴 P0 — **do before feature migrations**

---

### 1. `QueryClient` recreated on every render

**File:** `src/providers/index.tsx`

```tsx
const Providers = ({ children }: ProvidersProps) => {
  const queryClient = new QueryClient() // ← new instance every render
  ...
}
```

**Problem:** Defeats TanStack Query caching; can cause refetch loops and lost cache on parent re-renders.

**Fix:** `useState(() => new QueryClient())` or module-level singleton (Storybook already uses module-level in `.storybook/preview.ts`).

**Priority:** 🔴 P0

---

## 🟠 P1 — Deprecated APIs & Next.js 16 Gaps

### 2. `forwardRef` in shared UI components (React 19 deprecated)

React 19 accepts `ref` as a regular prop. `forwardRef` is deprecated.

| File | Components using `forwardRef` |
|------|-------------------------------|
| `src/components/shared/Input.tsx` | `Input` |
| `src/components/shared/Button.tsx` | `Button` |
| `src/components/shared/Checkbox.tsx` | `Checkbox` |
| `src/components/shared/Label.tsx` | `Label` |
| `src/components/shared/Slider.tsx` | `Slider` |
| `src/components/shared/Form.tsx` | `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` |

**Fix:** Migrate to ref-as-prop pattern. Run codemod: `npx codemod@latest react/19/replace-forward-ref`

**Note:** Radix/shadcn-style `Form.tsx` may need careful testing with react-hook-form refs after migration.

**Priority:** 🟠 P1

---

### 3. Unused legacy Ably package

**File:** `package.json`

```json
"@ably-labs/react-hooks": "^2.1.2"
```

**Problem:** Deprecated package; all 24 Ably imports use `ably/react`. Dead dependency adds confusion and audit noise.

**Fix:** Remove from `package.json` and run `yarn install`.

**Priority:** 🟠 P1

---

### 4. `revalidateTag()` single-argument usage (when Cache Components enabled)

**Current:** Wraglet uses `revalidatePath` only (profile photo routes). No `revalidateTag` yet.

**Next.js 16 change:** When Cache Components / tagged caching is adopted, `revalidateTag('tag')` without a second `cacheLife` profile is deprecated.

**Files to update when adding caching:**

- `src/app/api/update-cover-photo/route.ts`
- `src/app/api/update-photo-collection/route.ts`
- `src/app/api/update-profile-picture/route.ts`

**Fix pattern:**

```ts
import { updateTag } from 'next/cache'

// Server Action — read-your-writes
updateTag(`user-${userId}`)

// Or SWR background revalidation
revalidateTag('blog-posts', 'max')
```

**Priority:** 🟠 P1 (when enabling `cacheComponents: true`)

---

## 🟡 P2 — Architecture & React 19 / Next.js 16 Best Practices

### 5. Client Component pages (should be Server Component shells)

These entire route files are `'use client'`, forcing full client bundles and client-side data loading where the server could fetch first:

| File | Current pattern | Recommended pattern |
|------|-----------------|---------------------|
| `src/app/(authenticated)/[username]/page.tsx` | Client page + `useEffect` → `getPostsByUsername` Server Action | Async Server Component: `await params`, `await getPostsByUsername`, pass props to client wrapper |
| `src/app/(authenticated)/notifications/page.tsx` | Client + `useInfiniteQuery` | Server shell + `NotificationsClient` island (Query stays client-side for infinite scroll) |
| `src/app/(authenticated)/search/page.tsx` | Client + `useEffect` + `fetch` | Server shell reads `await searchParams`, prefetches or passes `q` to client; consider TanStack Query |
| `src/app/(authenticated)/messages/page.tsx` | Thin client wrapper only | Server page renders `<MessagesAbly />` via dynamic import from server shell |
| `src/app/(authenticated)/settings/account/page.tsx` | Client settings form | Server auth check in layout (done) + client form island |
| `src/app/(authenticated)/settings/profile/page.tsx` | Client + mutations | Same — optional Server Action for profile PATCH |
| `src/app/(authenticated)/settings/privacy/page.tsx` | Client | Same |
| `src/app/(authenticated)/settings/notifications/page.tsx` | Client | Same |

**Highest impact file:** `[username]/page.tsx` — fetches posts in `useEffect` despite having Server Actions available:

```tsx
// Current anti-pattern (lines 37–54)
useEffect(() => {
  const initializeData = async () => {
    const resolvedParams = await params
    const posts = await getPostsByUsername(decodedUsername)
    setInitialPosts(posts)
  }
  initializeData()
}, [params])
```

**Fix:** Convert to async Server Component (like `feed/page.tsx` and `blog/[slug]/page.tsx`).

**Priority:** 🟡 P2 — **Start with `[username]/page.tsx`**

---

### 6. Client-side fetch in `useEffect` (replace with Query or Server fetch)

| File | Pattern | Replacement |
|------|---------|-------------|
| `src/app/(authenticated)/search/page.tsx` | `useEffect` + `fetch('/api/search')` | TanStack `useQuery` (consistent with rest of app) or server prefetch + hydrate |
| `src/app/(authenticated)/[username]/page.tsx` | `useEffect` + Server Action | Server Component `await` |
| `src/components/auth/LoginVerifiedBanner.tsx` | `useEffect` reads `searchParams`, calls `router.replace` | Acceptable for URL cleanup; could use server redirect instead |

**Priority:** 🟡 P2

---

### 7. Optimistic updates — `useOptimistic` candidates

Manual `setPost` / `setPosts` optimistic patterns before API calls. Prime for `useOptimistic`:

| File | Interaction |
|------|-------------|
| `src/components/feed/Post.tsx` | Reactions, votes, comments |
| `src/components/feed/PostInteractions.tsx` | Duplicate of Post interaction logic |
| `src/components/feed/FeedWithAbly.tsx` | Feed-level post/share prepend |
| `src/components/profile/ProfileBody.tsx` | Profile feed realtime + create post |
| `src/components/blog/BlogReactionControls.tsx` | Blog reactions |
| `src/components/blog/BlogInteractions.tsx` | Comments + reactions |

**Priority:** 🟡 P2 — improves UX consistency with React 19 Actions model

---

### 8. Form mutations — `useActionState` / Server Actions candidates

> **Prerequisite:** React ≥ 19.2.7 and Next ≥ 16.2.10 (FormData fix). See 🔴 P0 §0.

Currently: react-hook-form + TanStack `useMutation` + axios. Works well for complex forms; simpler flows could migrate:

| File | Complexity | Recommendation |
|------|------------|----------------|
| `src/components/auth/LoginForm.tsx` | High (credentials-check + signIn) | Keep client mutation |
| `src/components/auth/SignUp.tsx` | High (Turnstile, multi-step) | Keep client |
| `src/components/auth/ForgotPasswordForm.tsx` | Low | Candidate for Server Action |
| `src/components/auth/ResetPasswordForm.tsx` | Medium | Candidate for Server Action |
| `src/components/auth/VerifyEmailPending.tsx` | Low (resend) | Candidate for Server Action |
| `src/app/(authenticated)/settings/account/page.tsx` | Medium | Partial Server Action for password change |
| `src/app/(authenticated)/settings/profile/page.tsx` | Medium | Partial Server Action |
| `src/app/(authenticated)/notifications/page.tsx` | Low (mark read) | `useActionState` + PATCH Server Action |

**Priority:** 🟡 P2 — migrate low-complexity forms first

---

### 9. Manual memoization — review when enabling React Compiler

Files with `useMemo` / `useCallback` (13 files):

| File | Count | Notes |
|------|-------|-------|
| `src/components/shared/SearchBar.tsx` | 6 | Review after compiler |
| `src/components/feed/UploadPostImage.tsx` | 5 | Image crop logic — may keep |
| `src/components/feed/RightNav.tsx` | 2 | Trending/activities queries |
| `src/components/feed/FeedClientWrapper.tsx` | 2 | Feed tab state |
| `src/components/feed/Post.tsx` | 3 | Reaction groups |
| `src/components/shared/Form.tsx` | 2 | Context value memo |
| `src/components/shared/BirthdayPicker.tsx` | 3 | Date parts |
| `src/components/blog/BlogImageUpload.tsx` | 3 | Preview URL |
| `src/components/chat/FeedNewChatModalWrapper.tsx` | 2 | Filtered users |
| `src/components/profile/ImageUploadCropModal.tsx` | 3 | Crop state |
| `src/components/profile/PhotoCollection.tsx` | 2 | Grid layout |
| `src/app/(authenticated)/notifications/page.tsx` | 2 | Flatten pages |

**Fix:** Enable `reactCompiler: true` in `next.config.ts`, profile, then remove redundant memoization.

**Priority:** 🟡 P2

---

### 10. `useReducer` for simple object state

Non-idiomatic reducers that spread `{ ...state, ...action }`:

| File | State |
|------|-------|
| `src/components/profile/ProfileBody.tsx` | `{ text, image }` |
| `src/components/feed/FeedClientWrapper.tsx` | `{ text, image, isLoading }` |
| `src/components/feed/CreatePost.tsx` | `{ openUploadModal }` |
| `src/components/profile/ProfilePictureHover.tsx` | modal open state |
| `src/components/profile/CoverPhotoHover.tsx` | modal open state |

**Fix:** Replace with `useState` or colocate into Zustand where shared. Not deprecated — just unnecessary complexity.

**Priority:** 🟡 P2 (cleanup when touching files)

---

### 11. Missing `generateMetadata` on dynamic routes

No `generateMetadata` exports found. Public/shareable routes would benefit:

| Route | Suggested metadata |
|-------|-------------------|
| `src/app/(authenticated)/post/[id]/page.tsx` | Post title, author, OG image |
| `src/app/(authenticated)/blog/[slug]/page.tsx` | Blog title, excerpt, cover image |
| `src/app/(authenticated)/[username]/page.tsx` | Profile name, avatar |

**Priority:** 🟡 P2 (SEO / social sharing)

---

### 12. Global `force-dynamic` — revisit with Cache Components

| File | Setting |
|------|---------|
| `src/app/layout.tsx` | `export const dynamic = 'force-dynamic'` |
| `src/app/(authenticated)/layout.tsx` | `export const dynamic = 'force-dynamic'` |

**Assessment:** Correct for authenticated, personalized app shell. Public routes (`(unauthenticated)/`) could opt into `"use cache"` individually without removing layout dynamic for auth routes.

**Priority:** 🟡 P2

---

### 13. `<Activity>` for preserved hidden UI

Candidates where state is preserved while UI is hidden:

| Component | Current | Improvement |
|-----------|---------|-------------|
| `src/app/(authenticated)/[username]/page.tsx` | Headless UI `Transition` for blog modal | `<Activity mode={showBlogModal ? 'visible' : 'hidden'}>` |
| `src/components/chat/ChatFloater.tsx` | Conditional render of floater panels | Activity for minimized conversations |
| `src/components/feed/MobileDiscoverDrawer.tsx` | Mount/unmount drawer | Activity when toggling |

**Priority:** 🟡 P2

---

### 14. `useEffectEvent` for Ably / DOM listeners

Effects that re-subscribe when deps change unnecessarily:

| File | Effect |
|------|--------|
| `src/providers/AblyProvider.tsx` | Session → Ably client lifecycle (already uses `startTransition`) |
| `src/components/chat/ChatWindow.tsx` | Scroll / message effects |
| `src/components/layout/Header.tsx` | Header effects |
| `src/components/auth/LoginVerifiedBanner.tsx` | URL param cleanup |

**Fix:** Extract listener callbacks with `useEffectEvent` to shrink dependency arrays.

**Priority:** 🟡 P2

---

## 🟢 P3 — Minor / Style / When Touching Code

### 15. `React.FC` / `FC` type annotation (legacy style)

| File |
|------|
| `src/components/auth/LoginForm.tsx` |
| `src/components/auth/ResetPasswordForm.tsx` |
| `src/components/auth/VerifyEmailPending.tsx` |
| `src/components/feed/FeedWithAbly.tsx` |
| `src/components/feed/FeedNoAbly.tsx` |
| `src/components/feed/Comment.tsx` |
| `src/components/feed/UploadPostImage.tsx` |
| `src/components/chat/NewChatModal.tsx` |
| `src/components/shared/ListBox.tsx` |
| `src/components/profile/ImageUploadCropModal.tsx` |
| `src/components/profile/UploadProfilePicture.tsx` |
| `src/components/profile/UploadCoverPhoto.tsx` |

**Fix:** Use plain function props typing (project convention already prefers arrow functions).

**Priority:** 🟢 P3

---

### 16. Duplicate post interaction components

`Post.tsx` and `PostInteractions.tsx` contain overlapping Ably + reaction + comment logic.

**Fix:** Consolidate into one component tree (`PostWithAbly` → `Post` or `PostInteractions`).

**Priority:** 🟢 P3

---

### 17. `startTransition` for state updates (already good)

Already used correctly in:

- `src/providers/AblyProvider.tsx`
- `src/components/feed/FeedWithAbly.tsx`
- `src/components/shared/BirthdayPicker.tsx`
- `src/components/blog/BlogImageUpload.tsx`

No change needed — extend this pattern when adding heavy state updates.

---

### 18. Enable optional Next.js 16 DX features

| Feature | Config | Benefit |
|---------|--------|---------|
| React Compiler | `reactCompiler: true` | Auto memoization |
| Cache Components | `cacheComponents: true` | Explicit public data caching |
| Turbopack FS cache | `experimental.turbopackFileSystemCacheForDev: true` | Faster dev restarts |

**Priority:** 🟢 P3 — enable incrementally with measurement

---

## File Index — All Targeted Files

### Providers & Root

| File | Issue | Priority |
|------|-------|----------|
| `src/providers/index.tsx` | QueryClient per render | 🔴 P0 |
| `src/providers/AblyProvider.tsx` | `useEffectEvent` opportunity | 🟡 P2 |
| `src/app/layout.tsx` | Review `force-dynamic` vs cache | 🟡 P2 |
| `next.config.ts` | No React Compiler / Cache Components | 🟢 P3 |

### Route Pages (Client → Server split)

| File | Issue | Priority |
|------|-------|----------|
| `src/app/(authenticated)/[username]/page.tsx` | Full client + useEffect fetch | 🟡 P2 |
| `src/app/(authenticated)/notifications/page.tsx` | Full client page | 🟡 P2 |
| `src/app/(authenticated)/search/page.tsx` | Full client + useEffect fetch | 🟡 P2 |
| `src/app/(authenticated)/messages/page.tsx` | Unnecessary client page | 🟡 P2 |
| `src/app/(authenticated)/settings/*/page.tsx` (4 files) | Full client pages | 🟡 P2 |

### Shared UI (`forwardRef`)

| File | Priority |
|------|----------|
| `src/components/shared/Input.tsx` | 🟠 P1 |
| `src/components/shared/Button.tsx` | 🟠 P1 |
| `src/components/shared/Checkbox.tsx` | 🟠 P1 |
| `src/components/shared/Label.tsx` | 🟠 P1 |
| `src/components/shared/Slider.tsx` | 🟠 P1 |
| `src/components/shared/Form.tsx` | 🟠 P1 |

### Feed / Real-time (useOptimistic)

| File | Priority |
|------|----------|
| `src/components/feed/Post.tsx` | 🟡 P2 |
| `src/components/feed/PostInteractions.tsx` | 🟡 P2 / 🟢 P3 dedupe |
| `src/components/feed/FeedWithAbly.tsx` | 🟡 P2 |
| `src/components/profile/ProfileBody.tsx` | 🟡 P2 |

### Auth Forms (useActionState candidates)

| File | Priority |
|------|----------|
| `src/components/auth/ForgotPasswordForm.tsx` | 🟡 P2 |
| `src/components/auth/ResetPasswordForm.tsx` | 🟡 P2 |
| `src/components/auth/VerifyEmailPending.tsx` | 🟡 P2 |

### Dependencies

| File | Issue | Priority |
|------|-------|----------|
| `package.json` | Remove `@ably-labs/react-hooks` | 🟠 P1 |

---

## Recommended Fix Order

When you're ready to implement, suggested sequence:

0. **🔴 P0** — Bump to `react@19.2.7`, `next@16.2.10`; run `yarn validate`
1. **🔴 P0** — Fix `QueryClient` in `src/providers/index.tsx` (small, high impact)
2. **🟠 P1** — Remove `@ably-labs/react-hooks`; run React 19 `forwardRef` codemod on shared UI
3. **🟡 P2** — Convert `[username]/page.tsx` to Server Component (biggest architecture win)
4. **🟡 P2** — Migrate `search/page.tsx` fetch to TanStack Query or server prefetch
5. **🟡 P2** — Add `useOptimistic` to `Post.tsx` reactions/votes
6. **🟡 P2** — Migrate low-complexity forms to `useActionState` (notifications mark-read, auth resend/forgot)
7. **🟡 P2** — Split remaining client pages into server shells + client islands
8. **🟡 P2** — Adopt `<Activity>` for blog modal / chat floater / mobile drawer
9. **🟡 P2** — Adopt `useEffectEvent` in AblyProvider + ChatWindow
10. **🟢 P3** — Enable React Compiler; profile and trim manual memoization
11. **🟢 P3** — Enable Cache Components for public/semi-static data; adopt `updateTag`/`revalidateTag(tag, 'max')` + `cacheSignal` where needed
12. **🟢 P3** — Add `generateMetadata` to post/blog/profile routes

---

## Hooks & Patterns — Replace / Keep Matrix

| Current pattern | Verdict | Replacement |
|-----------------|---------|---------------|
| `forwardRef` | **Replace** | `ref` as prop (React 19) |
| `useFormState` | N/A (not used) | `useActionState` if needed |
| `@ably-labs/react-hooks` | **Remove dep** | Already on `ably/react` ✅ |
| `useIsClient` + `useSyncExternalStore` | **Keep** | Modern SSR-safe hydration check |
| TanStack Query | **Keep** | Still best for client infinite/paginated data |
| react-hook-form + Zod | **Keep** | Complex forms |
| axios in mutations | **Keep for now** | Optional migrate to `fetch` / Server Actions |
| `useEffect` + fetch | **Replace** | Server Component `await` or `useQuery` |
| `useMemo` / `useCallback` | **Review** | React Compiler or remove if cheap |
| `dynamic(..., { ssr: false })` for Ably | **Keep** | Required per Ably pattern |
| `revalidatePath` only | **Extend** | Add `updateTag` when caching enabled |
| `useReducer` for `{...state}` | **Simplify** | `useState` |
| `React.FC` | **Remove** | Explicit props types |
| Sync `params` / `cookies()` | **N/A** | Already async where used ✅ |
| Stay on React 19.2.4 / Next 16.2.2 | **Upgrade** | Roll forward to 19.2.7 / 16.2.10 (security + FormData) |
| `useActionState` + FormData forms | **Adopt after bump** | Requires ≥ 19.2.7 / ≥ 16.2.7 |
| `<Activity>` / `useEffectEvent` | **Adopt** | Modals, floaters, Ably effects (19.2.0+ features, still unused) |

---

## Out of Scope / No Action Needed

- **`middleware.ts` / `proxy.ts`** — Neither exists; add `proxy.ts` only when network-boundary routing is needed
- **`pages/` router** — Not used
- **`next/head`** — Not used; `metadata` exports in use
- **`react-test-renderer`** — Not used
- **`AMP`** — Not used
- **Parallel routes** — Not detected; no `default.js` requirement
- **Ably `ChannelProvider` pattern** — Largely compliant with project rules; Post/Blog components correctly wrapped by parent providers

---

*Review this audit before implementation. Each fix should be a focused PR with tests where behavior changes.*
