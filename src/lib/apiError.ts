/** Safe message for JSON error responses (avoid leaking internals in production). */
export const safeApiError = (
  error: unknown,
  fallback = 'Something went wrong'
): string => {
  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof Error && error.message) return error.message
  }
  return fallback
}
