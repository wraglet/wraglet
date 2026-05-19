# API response contracts (Wraglet)

Reference for **JSON shapes** returned by App Router handlers under `src/app/api/**`. Use for client assumptions, Playwright expectations, and Vitest (`z.safeParse` on fixtures). Authoritative runtime checks live in **`src/contracts/*.ts`** (Zod); this doc is the human-readable index.

**Static mocks (MSW):** Example responses live in `src/test/mock-rest/api/**/route.json` (same folder layout as `src/app/api/`, except no auth catch‑all). They are merged into `MOCK_REST_CATALOG` (`src/test/mock-rest/catalog.ts`). Build handlers with `toMockRestHttpHandlers(baseUrl, MOCK_REST_CATALOG.filter(...))` from `@/test/mock-rest`. Entries with the same path and HTTP method are merged in MSW: optional `query` on a fixture selects that variant; several no‑query variants cannot be told apart (first in file order wins), so tests should pass a **filtered** slice of the catalog when needed. See `src/test/integration/feedBlogList.msw.test.ts` and `mockRestCatalog.msw.test.ts`.

**Mock coverage:** `34` `route.ts` modules under `src/app/api`; **`33`** have `route.json` fixtures. The only intentional gap is `auth/[...nextauth]` (NextAuth / Playwright). `src/test/mock-rest/routeCoverage.test.ts` enforces this. Fixtures for routes with Zod contracts are validated in `catalogContracts.test.ts` against `src/contracts/*` (shared primitives in `src/contracts/shared.ts` mirror handler `.select` / `.populate` fields).

**Population shapes (no guessing):**

| Snippet                                 | Fields                                                                  | Used by                                                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `userPopulationSnippetSchema`           | `_id`, `firstName`, `lastName`, `username`, `gender`, `profilePicture?` | activities, messages, notifications, conversations, search post author, reaction `userId`, shares `sharedBy`, share `originalPost.author`, etc. |
| `postAuthorSchema`                      | above + `pronoun`                                                       | post feed author, comment author on posts/blogs                                                                                                 |
| `postDetailAuthorSchema`                | above + `coverPhoto?`                                                   | `GET /api/posts/[postId]`, react/vote mutations                                                                                                 |
| `trendingUserSchema`                    | snippet + `followerCount`                                               | `/api/users/trending`, `/api/users/suggested`                                                                                                   |
| `discoverUserSchema`                    | snippet + `createdAt`, `score`, `isTrending`, `isRecentActive`, `isNew` | `/api/users/discover`                                                                                                                           |
| `blogListItemSchema` / `blogCoreSchema` | list vs detail (with `contentBlocks`)                                   | `/api/blogs`, `/api/blogs/[slug]`                                                                                                               |
| `shareDocumentSchema`                   | share + populated `originalPost` (author without `pronoun`)             | `/api/shares`, share react/vote/comment                                                                                                         |
| `ablyTokenRequestSchema`                | Ably `createTokenRequest` fields                                        | `/api/token`                                                                                                                                    |
| `publicUserSchema`                      | user without `hashedPassword`                                           | profile/cover/photo-collection PATCH                                                                                                            |

**Contract modules:** `shared.ts` (primitives), plus `activities`, `blogs`, `shares`, `postsApi`, `postsFeed`, `conversations`, `messages`, `notifications`, `search`, `follows`, `register`, `usersApi`, `topicsTrending`, `token`, `admin`, `media`. MSW fixtures for all mapped routes are checked in `catalogContracts.test.ts`.

Handlers below have **at least one Vitest case** (status + body or envelope) unless noted.

| Route                            | Method              | Status              | Body shape (summary)                                                          |
| -------------------------------- | ------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `/api/search`                    | GET                 | 200                 | `{ success, results[], totalCount, query }` — see `searchResponseSchema`      |
| `/api/search`                    | GET                 | 500                 | `{ success: false, results: [], totalCount: 0, query: '' }`                   |
| `/api/posts`                     | GET                 | 200                 | `{ posts[], nextCursor }` (trending or mixed feed)                            |
| `/api/posts`                     | GET                 | 401                 | `{ posts: [], nextCursor: null }`                                             |
| `/api/posts`                     | POST                | 200                 | Post document (text, optional image base64, optional `blogPreview`)           |
| `/api/posts`                     | POST                | 401                 | text `Unauthorized`                                                           |
| `/api/posts/[postId]`            | GET                 | 200                 | Post JSON (`convertObjectIdsToStrings`)                                       |
| `/api/posts/[postId]`            | GET                 | 401/404             | `{ error }`                                                                   |
| `/api/posts/[postId]/react`      | PATCH, DELETE       | 200/401             | see existing contract tests                                                   |
| `/api/posts/[postId]/vote`       | POST, PATCH, DELETE | 200/401             | see existing contract tests                                                   |
| `/api/posts/[postId]/comment`    | POST                | 200/400/401         | Comment / text errors                                                         |
| `/api/shares`                    | GET                 | 200                 | `{ shares[], nextCursor, hasMore }`                                           |
| `/api/shares`                    | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/shares`                    | POST                | 200/400/401/404/409 | Share JSON or `{ error }`                                                     |
| `/api/shares/[shareId]/react`    | PATCH               | 200                 | Updated share document                                                        |
| `/api/shares/[shareId]/react`    | PATCH               | 401                 | text `Unauthorized`                                                           |
| `/api/shares/[shareId]/vote`     | PATCH               | 200/401             | Updated share / unauthorized                                                  |
| `/api/shares/[shareId]/comment`  | POST                | 200/400/401         | Comment object                                                                |
| `/api/blogs`                     | GET                 | 200                 | `{ blogs[], nextCursor, hasMore }`                                            |
| `/api/blogs`                     | GET                 | 400                 | `{ error }` e.g. invalid `author` ObjectId                                    |
| `/api/blogs`                     | POST                | 401/400             | Validation errors (see route)                                                 |
| `/api/blogs/[slug]`              | GET                 | 200                 | Blog JSON (published or author’s draft) / increments views when published     |
| `/api/blogs/[slug]`              | GET                 | 404                 | `{ error: 'Blog not found' }`                                                 |
| `/api/blogs/[slug]/react`        | PATCH               | 200/400/401         | Blog JSON                                                                     |
| `/api/blogs/[slug]/comment`      | POST                | 200/400/401         | Comment JSON                                                                  |
| `/api/blogs/upload-image`        | POST                | 200                 | `{ url, key }`                                                                |
| `/api/blogs/upload-image`        | POST                | 400/401             | `Unauthorized` or `{ error }`                                                 |
| `/api/activities`                | GET                 | 200                 | `{ success: true, activities[] }`                                             |
| `/api/activities`                | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/notifications`             | GET                 | 200                 | `{ notifications[], unreadCount, hasMore, nextCursor }`                       |
| `/api/notifications`             | PATCH               | 200                 | `{ success: true, unreadCount }`                                              |
| `/api/conversations`             | GET                 | 200                 | `{ success: true, data[] }`                                                   |
| `/api/conversations`             | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/messages`                  | GET                 | 200                 | `{ success: true, data[] }` (requires `x-conversation-id`)                    |
| `/api/messages`                  | GET                 | 400                 | `{ error: 'Conversation ID required' }`                                       |
| `/api/messages`                  | POST                | 200                 | `{ success: true, data }`                                                     |
| `/api/messages`                  | POST                | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/users`                     | GET                 | 200                 | `{ success: true, users[] }`                                                  |
| `/api/users`                     | PATCH               | 200                 | `{ success: true, user }`                                                     |
| `/api/users`                     | PATCH               | 401                 | `{ error }`                                                                   |
| `/api/users/password`            | PATCH               | 200                 | `{ success: true }`                                                           |
| `/api/users/password`            | PATCH               | 400/401             | `{ error }` / unauthorized                                                    |
| `/api/users/trending`            | GET                 | 200                 | `{ success: true, users[] }`                                                  |
| `/api/users/trending`            | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/users/suggested`           | GET                 | 200                 | `{ success: true, users[] }`                                                  |
| `/api/users/suggested`           | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/users/discover`            | GET                 | 200                 | `{ success: true, users[] }` (ranked)                                         |
| `/api/users/discover`            | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/users/people-you-may-know` | GET                 | 200                 | `{ success: true, users[] }`                                                  |
| `/api/users/people-you-may-know` | GET                 | 401                 | `{ error: 'Unauthorized' }`                                                   |
| `/api/users/topics-trending`     | GET                 | 200                 | `{ success: true, topics[] }`                                                 |
| `/api/follows`                   | GET                 | 200                 | `{ followingIds[] }` **or** `{ followersCount, followingCount, isFollowing }` |
| `/api/follows`                   | GET                 | 401                 | `{ followingIds: [] }` (no session, no `userId`)                              |
| `/api/follows`                   | POST/DELETE         | 200                 | `{ success: true }`                                                           |
| `/api/follows`                   | POST                | 400/401/409         | `{ success: false, error }`                                                   |
| `/api/register`                  | POST                | 200                 | User JSON (created document)                                                  |
| `/api/register`                  | POST                | 400                 | text `Missing info`                                                           |
| `/api/register`                  | POST                | 409                 | `{ error }` duplicate email (Mongo `11000`)                                   |
| `/api/register`                  | POST                | 500                 | text `Internal Error` (other failures)                                        |
| `/api/token`                     | GET                 | 200                 | Ably token request JSON                                                       |
| `/api/token`                     | GET                 | 401/500             | Unauthorized / missing `ABLY_API_KEY`                                         |
| `/api/admin/notifications`       | POST                | 200                 | `{ success, count, message }`                                                 |
| `/api/admin/notifications`       | POST                | 400/401/404         | Validation / auth / recipient not found                                       |
| `/api/update-profile-picture`    | PATCH               | 200                 | User JSON                                                                     |
| `/api/update-profile-picture`    | PATCH               | 400/401/500         | Invalid data / unauthorized / error                                           |
| `/api/update-cover-photo`        | PATCH               | 200                 | User JSON                                                                     |
| `/api/update-cover-photo`        | PATCH               | 400/401/500         | Invalid data / unauthorized / error                                           |
| `/api/update-photo-collection`   | PATCH               | 200                 | User or photo JSON (by `action`)                                              |
| `/api/update-photo-collection`   | PATCH               | 401                 | text `Unauthorized`                                                           |
| `/api/auth/[...nextauth]`        | \*                  | \*                  | Covered by **Playwright** + NextAuth integration; not Vitest handler suite    |

**§5.1 Feed client:** `FeedClientWrapper` reads `GET /api/blogs` via `axios`; see `src/test/integration/feedBlogList.msw.test.ts` (MSW envelope check).

Envelopes are intentionally inconsistent across routes today; Zod schemas document the **common** success paths covered by Vitest. When changing a handler, update the matching export in **`src/contracts/`** and this table. Many modules export **`z.infer<typeof schema>`** aliases (e.g. `FollowsFollowingIdsResponse`) for reuse in app code.

See also: [`docs/TESTING.md`](./TESTING.md).

---

## Plan §6 risks → coverage in this repo

| §6                                           | Mitigation                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Inconsistent JSON envelopes                  | `src/contracts/*` + this table; handler tests use mocks and assert status/body.                   |
| `activities` `post.content` object vs string | `getPostContentPreviewSnippet` + `src/app/api/activities/route.test.ts`.                          |
| Suggested users internal HTTP                | `getTrendingUsersWithFollowerCounts` (no `fetch` to self).                                        |
| `'use server'` on route modules              | Removed from `messages` / `conversations` route files.                                            |
| Share vs post IDs                            | `buildShareAsPost` + `src/utils/buildShareAsPost.test.ts`; share vs post route tests.             |
| Chat double-write / Ably partial failure     | `messages/route.test.ts` exercises Ably publish on success; DB/Ably split failure not automated.  |
| Session ID shape vs ObjectId                 | Covered indirectly via mocked `getCurrentUser` in route tests; add targeted cases if bugs appear. |
