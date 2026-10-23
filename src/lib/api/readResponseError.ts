const MAX_PLAIN_ERROR_LENGTH = 300

/**
 * Message for a failed fetch. Prefers a JSON `{ error }`, then a short plain-text
 * body (for example `Unauthorized`), then the fallback plus the HTTP status.
 * A JSON parse failure is not the server error, so it is not what gets shown.
 */
export const readResponseError = async (
  response: Response,
  fallback: string
): Promise<string> => {
  let text = ''
  try {
    text = (await response.text()).trim()
  } catch {
    return `${fallback} (${response.status})`
  }

  if (text) {
    try {
      const data = JSON.parse(text) as { error?: unknown }
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error
      }
    } catch {
      if (text.length <= MAX_PLAIN_ERROR_LENGTH && !text.startsWith('<')) {
        return text
      }
    }
  }

  return `${fallback} (${response.status})`
}
