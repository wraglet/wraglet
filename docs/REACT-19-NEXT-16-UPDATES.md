# React 19 & Next.js 16 — Features, Best Practices & Migration Reference

> Reference document for the Wraglet upgrade path.  
> **Last reviewed:** July 9, 2026  
> **Latest stable (npm):** `react@19.2.7`, `react-dom@19.2.7`, `next@16.2.10`  
> **Wraglet installed:** `react@19.2.4`, `react-dom@19.2.4`, `next@16.2.2` — **8 patch versions behind on React, 8 on Next**

Official sources:

- [React 19 release](https://react.dev/blog/2024/12/05/react-19)
- [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2)
- [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React changelog](https://github.com/facebook/react/blob/main/CHANGELOG.md)
- [Next.js 16 release](https://nextjs.org/blog/next-16)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js releases](https://github.com/vercel/next.js/releases)

---

## 0. Latest Stable Patch Releases (19.2.5–19.2.7 / 16.2.3–16.2.10)

> **Key takeaway:** Patch releases since Wraglet’s pinned versions add **no major new APIs**. They are security hardening, Server Action / RSC stability fixes, and npm packaging corrections. **Roll forward to latest stable before adopting Server Actions with `<form action>` + `FormData`.**

### React 19.2.5 → 19.2.7

| Version | Date | What changed |
|---------|------|--------------|
| **19.2.7** | Jun 1, 2026 | **Fix:** missing `FormData` entries in Server Actions (regression from 19.2.6). Critical if migrating forms to `useActionState` + native `<form action>`. |
| **19.2.6** | May 6, 2026 | RSC type hardening + performance; bundled CVE-2026-23870 DoS fix for Server Components. **Introduced the FormData regression** fixed in 19.2.7. |
| **19.2.5** | Mar 18, 2026 | Additional RSC cycle protections. |
| **19.2.4** *(Wraglet)* | Jan 26, 2026 | DoS mitigations for Server Actions + Server Components hardening. |

**Wraglet impact:** Server Actions exist (`src/actions/*`) but are invoked as **async functions from the client**, not via `<form action>` + `FormData`. The FormData bug does not affect current code, but **any `useActionState` migration must target React ≥ 19.2.7** (and Next ≥ 16.2.7).

### Next.js 16.2.3 → 16.2.10

| Version | Date | What changed |
|---------|------|--------------|
| **16.2.10** | Jul 1, 2026 | Republishes `@next/swc-wasm-web` (missing since 16.2.4). No framework code changes. |
| **16.2.9 / 16.2.8** | Jun 10, 2026 | Empty releases to fix `next@latest` npm dist-tag (Trusted Publishing limitation). |
| **16.2.7** | Jun 1, 2026 | Backport bundle: **Don’t drop `FormData` entries** (pairs with React 19.2.7), non-ASCII `cacheTag` encoding fix, server-action forwarding loop fix with middleware rewrites, dev hydration fix when page served from HTTP cache, catch-all `router.query` corruption with `basePath` + rewrites, `playwright-core` request-failed promise fix. |
| **16.2.6** | May 7, 2026 | **13 security advisories** (RSC DoS, proxy/middleware bypass, cache poisoning, Image Optimization DoS, CSP nonce XSS, WebSocket SSRF, etc.). |
| **16.2.5** | May 6, 2026 | Overlapping security batch + route param double-encoding fix, `cacheHandlers` deployment-id keys. |
| **16.2.4** | Apr 15, 2026 | Turbopack watcher/symlink fixes, Google Fonts on Windows ARM64, compiler define support. |
| **16.2.3** | Apr 8, 2026 | CVE-2026-23869 fix, manifest.ts HMR fix, styled-jsx race condition fix. |
| **16.2.2** *(Wraglet)* | — | Baseline at audit time. |

**Wraglet impact:**

| Fix in latest stable | Relevant to Wraglet? |
|----------------------|----------------------|
| RSC / Server Action DoS (CVE-2026-23870 et al.) | **Yes** — upgrade recommended |
| FormData in Server Actions | **Yes when migrating** forms to Actions (not yet) |
| Non-ASCII `cacheTag` encoding | **Yes when enabling** `"use cache"` with i18n tags |
| Image Optimization DoS | **Yes** — uses `next/image` in 16 files |
| Cache poisoning in RSC responses | **Yes** — any Server Component app |
| Proxy/middleware bypass | **Low now** — no `middleware.ts` / `proxy.ts` yet |
| `@next/swc-wasm-web` missing | **Low** — only affects WASM SWC consumers |

### Recommended version bump (do first)

```bash
yarn add react@19.2.7 react-dom@19.2.7 next@16.2.10 eslint-config-next@16.2.10
yarn validate
```

No codemods required for this patch bump. Re-run the audit implementation items after upgrading.

---

## 1. React 19 — What Changed

React 19 is a foundational shift toward **first-class async UI**: forms, mutations, and data loading get native primitives instead of hand-rolled `useEffect` + `useState` boilerplate.

### 1.1 Actions

**Actions** are async functions passed to `<form action={fn}>`, `formAction`, or wrapped in `startTransition`. React automatically tracks:

- Pending state
- Error propagation (to nearest Error Boundary)
- Optimistic rollback on failure
- Form reset after successful submission

```tsx
'use client'

import { useActionState } from 'react'

const updateProfile = async (_prev: string | null, formData: FormData) => {
  const res = await fetch('/api/users', { method: 'PATCH', body: formData })
  if (!res.ok) return 'Update failed'
  return null
}

export const ProfileForm = () => {
  const [error, submitAction, isPending] = useActionState(updateProfile, null)

  return (
    <form action={submitAction}>
      <input name="bio" />
      <button disabled={isPending}>Save</button>
      {error && <p>{error}</p>}
    </form>
  )
}
```

**Best practice:** Prefer Server Actions + `<form action>` for mutations that don't need rich client-side validation UX. Keep `react-hook-form` + Zod where complex field-level validation is required (Wraglet auth/settings forms).

### 1.2 New Hooks

| Hook | Purpose | Replaces / complements |
|------|---------|------------------------|
| `useActionState` | Action state + pending flag for forms | Manual `useState(isPending)` + `useFormState` (renamed) |
| `useFormStatus` | Read parent `<form>` pending state from child | Prop drilling `isPending` to submit buttons |
| `useOptimistic` | Show expected UI during async transitions | Manual optimistic state + rollback logic |
| `use()` | Read Promises or Context **during render** (can be conditional) | Some `useEffect` + `useState` fetch patterns; conditional context reads |
| `useEffectEvent` *(React 19.2)* | Stable callback for Effect bodies without stale closures | `useCallback` inside `useEffect` dependency arrays |

### 1.3 `use()` — Conditional Context & Promise Reading

Unlike other hooks, `use()` can be called inside conditionals and loops:

```tsx
import { use } from 'react'

// Server Component — suspend until promise resolves
const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params // Next.js 16 async params (see §2.3)
  const blog = use(fetchBlog(slug)) // or await fetchBlog(slug) in async SC
  return <BlogDetail blog={blog} />
}
```

**Best practice:** In Server Components, plain `await` is usually clearer than `use(promise)`. Reserve `use()` for Client Components reading context conditionally or integrating with Suspense boundaries.

### 1.4 `useOptimistic` — Real-Time Friendly Updates

Ideal for Wraglet's reactions, votes, and comments:

```tsx
const [optimisticPost, addOptimistic] = useOptimistic(post, (state, update) =>
  mergePostClientUpdate(state, update)
)

const handleReaction = async (type: string) => {
  addOptimistic({ reactions: [...post.reactions, { type, userId: user }] })
  await fetch(`/api/posts/${post._id}/react`, { method: 'PATCH', body: JSON.stringify({ type }) })
}
```

Pairs naturally with Ably: apply optimistic update locally, let Ably echo confirm or dedupe.

### 1.5 Ref as a Regular Prop — `forwardRef` Deprecated

React 19 allows `ref` as a normal prop on function components. `forwardRef` still works but is deprecated and will be removed in a future minor.

```tsx
// React 19+
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

export const Input = ({ ref, ...props }: InputProps) => (
  <input ref={ref} {...props} />
)
```

**Codemod:** `npx codemod@latest react/19/replace-forward-ref`

### 1.6 React 19.2 Additions (via Next.js 16)

| Feature | Use case | Wraglet usage |
|---------|----------|---------------|
| `<Activity mode="visible\|hidden">` | Preserve state while hiding UI (modals, tabs, chat floaters) instead of unmounting | **Not used** — blog modal, chat floater, mobile drawer are candidates |
| View Transitions API | Animated route/content transitions when wrapped in `startTransition` | **Not used** — optional for feed/tab navigation |
| `useEffectEvent` | Extract non-reactive Effect logic (Ably listeners, scroll handlers) without re-subscribing on every dep change | **Not used** — AblyProvider, ChatWindow, Header are candidates |
| `cacheSignal` *(RSC only)* | Detect when a `"use cache"` lifetime ends inside cached server functions | **Not used** — relevant when Cache Components are enabled |
| React Performance Tracks | Timeline overlays in browser DevTools for render/commit phases | **Dev-only** — enable after upgrade for profiling |
| Partial Pre-Render resume APIs | `resume`, `resumeAndPrerender` for streaming RSC (framework-level) | Handled by Next.js — no direct Wraglet code |

### 1.7 Removed / Deprecated React APIs

| Removed in React 19 | Replacement |
|---------------------|-------------|
| `ReactDOM.render`, `ReactDOM.hydrate` | `createRoot`, `hydrateRoot` |
| String refs, `contextTypes`, `getChildContext` | `createContext`, `useContext` |
| `propTypes` on function components | TypeScript |
| `react-test-renderer` (web) | `@testing-library/react` + Vitest |
| `element.ref` access on React elements | `element.props.ref` |

### 1.8 React Compiler (Stable, Opt-In)

The React Compiler (formerly "Forget") auto-memoizes components at build time, reducing the need for manual `useMemo`, `useCallback`, and `React.memo`.

**Enable in Next.js 16:**

```ts
// next.config.ts
const nextConfig = {
  reactCompiler: true,
}
```

```bash
yarn add -D babel-plugin-react-compiler@latest
```

**Best practice:** Enable only after profiling. Compile times increase. With the compiler on, remove redundant manual memoization rather than keeping both.

---

## 2. Next.js 16 — What Changed

### 2.1 Turbopack (Default Bundler)

Turbopack is now the default for `next dev` and `next build`:

- 2–5× faster production builds
- Up to 10× faster Fast Refresh

**Escape hatch:** `next dev --webpack` / `next build --webpack` for incompatible custom webpack configs.

**Optional dev speedup:**

```ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}
```

### 2.2 Cache Components & `"use cache"`

Next.js 16 replaces implicit App Router caching with **opt-in** Cache Components:

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,
}
```

```tsx
'use cache'

import { cacheLife, cacheTag } from 'next/cache'

export async function getTrendingTopics() {
  cacheLife('hours')
  cacheTag('trending-topics')
  return db.topics.findTrending()
}
```

| API | When to use |
|-----|-------------|
| `"use cache"` | Explicit server-side caching of pages, components, or functions |
| `cacheLife('max' \| 'hours' \| 'days' \| …)` | TTL / stale-while-revalidate profiles |
| `cacheTag('key')` | Tag cached entries for targeted invalidation |
| `revalidateTag(tag, profile)` | SWR invalidation — **now requires 2nd `cacheLife` argument** |
| `updateTag(tag)` | Server Actions only — read-your-writes (immediate fresh data) |
| `refresh()` | Server Actions only — refresh uncached dynamic data without touching cache |

**Breaking behavior:** `fetch()` in Server Components is **no longer cached by default**. Anything that relied on implicit caching in Next.js 15 will run uncached in 16 unless you add `"use cache"` or explicit cache options.

### 2.3 Async Request APIs (Breaking — Required)

All dynamic request APIs are **async only**. Sync access throws at runtime.

| API | Next.js 16 pattern |
|-----|-------------------|
| Route `params` | `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params` |
| Route `searchParams` | `{ searchParams }: { searchParams: Promise<{ q?: string }> }` → `await searchParams` |
| `cookies()` | `const cookieStore = await cookies()` |
| `headers()` | `const headerList = await headers()` |
| `draftMode()` | `const { isEnabled } = await draftMode()` |

**Codemod:** `npx @next/codemod@canary upgrade latest`

### 2.4 `proxy.ts` Replaces `middleware.ts`

`middleware.ts` is deprecated. Rename to `proxy.ts` and export a `proxy` function. Runs on **Node.js runtime** by default (full Node APIs, not Edge sandbox).

Wraglet currently has **neither** file — no action unless auth redirects / rewrites are added at the network boundary.

### 2.5 Other Notable Breaking / Behavior Changes

| Change | Impact |
|--------|--------|
| Node.js ≥ 20.9 required | Node 18 unsupported |
| `next lint` removed | Use `eslint` directly (Wraglet already does) |
| AMP fully removed | N/A for Wraglet |
| `unstable_cache` removed | Use `"use cache"` |
| `revalidateTag(tag)` single-arg deprecated | Add `cacheLife` profile: `revalidateTag('posts', 'max')` |
| `images.minimumCacheTTL` default 60s → 4h | Review image CDN cache headers |
| `images.qualities` default narrowed to `[75]` | Audit custom `quality` props on `<Image>` |
| Parallel routes require explicit `default.js` | Only if using parallel routes |
| PPR / `experimental.ppr` removed | Replaced by Cache Components model |

### 2.6 React Compiler in Next.js 16

Stable integration — same as §1.8. Not enabled by default in Next.js 16 config.

### 2.7 Developer Experience

- **Enhanced routing:** Layout deduplication + incremental prefetching (automatic, no code changes)
- **DevTools MCP:** AI-assisted debugging with route/caching context
- **Separate dev/build output dirs:** `next dev` and `next build` can run concurrently
- **Improved terminal logs:** Compile vs render timing breakdown

---

## 3. Recommended Architecture (2026)

### 3.1 Server vs Client Boundary

```
Page (Server Component, async)
├── fetch data / Server Actions
├── pass serializable props ↓
└── ClientWrapper ("use client", thin)
    └── dynamic(..., { ssr: false }) → AblyWrapper
        ├── AblyProvider + connection state
        ├── ChannelProvider + useChannel
        └── UI component
```

**Rules:**

- Default to Server Components
- Add `"use client"` only for: state, effects, browser APIs, event handlers, third-party client libs (Ably, TipTap, charts)
- Keep client islands small; push data fetching up to the server

### 3.2 Data Fetching Strategy for Wraglet

| Layer | Tool | Best for |
|-------|------|----------|
| Server Components / Server Actions | `await` + Mongoose | Initial page data, SEO, auth-gated reads |
| Client interactive lists | TanStack Query | Infinite scroll, polling, cache invalidation (feed, notifications) |
| Real-time | Ably `useChannel` | Live reactions, messages, presence |
| Forms (simple) | `useActionState` + Server Actions | Settings toggles, mark-as-read |
| Forms (complex) | react-hook-form + Zod + mutation | Auth, blog editor, multi-step |

### 3.3 Caching Strategy for Wraglet

Wraglet uses `export const dynamic = 'force-dynamic'` at root and authenticated layout — appropriate for a personalized social app. Opportunities:

- **`"use cache"`** for public/legal pages, trending topics, discover lists (with short `cacheLife`)
- **`updateTag`** in profile/photo Server Actions instead of only `revalidatePath`
- **Audit client-side `fetch`/`axios`** after upgrade — server fetches won't implicitly cache

### 3.4 Testing (Already Aligned)

Wraglet follows the project standard:

- **Vitest** — test runner
- **RTL + user-event** — component tests
- **Playwright** — E2E critical flows
- **MSW** — API mocking

Avoid `react-test-renderer` (deprecated in React 19).

### 3.5 Migration Tooling Checklist

```bash
# React 19 codemods
npx codemod@latest react/19/migration-recipe
npx codemod@latest react/19/replace-forward-ref
npx codemod@latest react/19/replace-use-form-state

# Next.js 16 upgrade
npx @next/codemod@canary upgrade latest

# Lint migration (if needed)
npx @next/codemod@canary next-lint-to-eslint-cli .
```

---

## 4. Quick Decision Matrix

| Situation | Use |
|-----------|-----|
| Form submit with server validation | Server Action + `useActionState` |
| Complex multi-field form | react-hook-form + Zod (keep current pattern) |
| Optimistic reaction/vote/comment | `useOptimistic` + API call + Ably confirm |
| Initial page data | Server Component `await` |
| Paginated/infinite client list | TanStack Query (keep current pattern) |
| Real-time updates | Ably `ChannelProvider` + `useChannel` |
| Hide UI but keep state (modal, tab) | `<Activity mode="hidden">` |
| Effect with stale closure risk | `useEffectEvent` |
| Expensive derived value, no compiler | `useMemo` (remove once React Compiler enabled) |
| Public semi-static data | `"use cache"` + `cacheTag` |
| User expects instant own writes | `updateTag` in Server Action |

---

## 5. Version Requirements Summary

| Requirement | Minimum | Wraglet recommended |
|-------------|---------|---------------------|
| Node.js | 20.9+ | ✅ (verify CI/runtime) |
| TypeScript | 5.1+ | ✅ 5.6 |
| React | 19.x | **19.2.7** (not 19.2.6 — FormData regression) |
| Next.js | 16.x | **16.2.10** (security batch in 16.2.5–16.2.6) |
| Browsers | Chrome/Edge/Firefox 111+, Safari 16.4+ | ✅ |

---

## 6. What Latest Stable Does *Not* Change

The 19.2.5–19.2.7 and 16.2.3–16.2.10 patches do **not** introduce replacements for:

- `forwardRef` → still deprecated; ref-as-prop migration still needed
- Client-side `useEffect` fetch → still an anti-pattern; Server Component `await` still preferred
- TanStack Query for infinite lists → still the right tool
- Ably `ChannelProvider` + `useChannel` → still correct

The audit findings in [WRAGLET-AUDIT-FIXES.md](./WRAGLET-AUDIT-FIXES.md) remain valid. Latest stable **adds urgency** to the version bump and **unblocks** safe Server Action form migrations.

---

*This document is the feature reference. See [WRAGLET-AUDIT-FIXES.md](./WRAGLET-AUDIT-FIXES.md) for file-specific findings and recommended changes.*
