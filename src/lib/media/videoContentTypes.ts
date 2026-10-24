/**
 * Containers the video pipeline can probe (`moov/mvhd`) and transcode. ISO BMFF only;
 * WebM/Matroska is intentionally not accepted.
 */
export const ACCEPTED_VIDEO_CONTENT_TYPES = [
  'video/mp4',
  'video/quicktime'
] as const

export type AcceptedVideoContentType =
  (typeof ACCEPTED_VIDEO_CONTENT_TYPES)[number]

export const ACCEPTED_VIDEO_ACCEPT_ATTR = ACCEPTED_VIDEO_CONTENT_TYPES.join(',')

export const isAcceptedVideoContentType = (
  type: string
): type is AcceptedVideoContentType =>
  (ACCEPTED_VIDEO_CONTENT_TYPES as readonly string[]).includes(type)
