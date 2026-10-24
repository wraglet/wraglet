export type ModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs_review'

export type AdminPostStatus = 'visible' | 'hidden' | 'under_review'

export const moderationStatusToAdminStatus = (
  status: ModerationStatus
): AdminPostStatus => {
  switch (status) {
    case 'approved':
      return 'visible'
    case 'needs_review':
      return 'under_review'
    case 'pending':
    case 'rejected':
    default:
      return 'hidden'
  }
}

export const adminStatusToModerationStatus = (
  status: AdminPostStatus
): ModerationStatus => {
  switch (status) {
    case 'visible':
      return 'approved'
    case 'under_review':
      return 'needs_review'
    case 'hidden':
    default:
      return 'rejected'
  }
}

export const isFeedVisibleStatus = (
  status?: ModerationStatus | null
): boolean => status === 'approved' || status === 'needs_review'
