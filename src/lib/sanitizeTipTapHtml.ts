import DOMPurify from 'isomorphic-dompurify'

/** Server- and client-safe HTML for TipTap blog bodies (strips scripts/handlers). */
export const sanitizeTipTapHtml = (html: string): string =>
  DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
