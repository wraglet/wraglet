/**
 * Build a Web API Request for App Router handler tests (`GET`, `POST`, etc.).
 * Prefer absolute URLs so `new URL(request.url)` in handlers behaves like production.
 */
export const buildAppRouteRequest = (
  pathnameWithQuery: string,
  init: RequestInit = {}
): Request => {
  let url: string
  if (pathnameWithQuery.startsWith('http')) {
    url = pathnameWithQuery
  } else {
    const path = pathnameWithQuery.startsWith('/')
      ? pathnameWithQuery
      : `/${pathnameWithQuery}`
    url = `http://localhost:5000${path}`
  }
  return new Request(url, init)
}
