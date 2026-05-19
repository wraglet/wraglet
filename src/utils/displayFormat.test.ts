import {
  formatDisplayUsername,
  formatSearchUserSubtitle,
  formatUserPhotoAlt,
  getBlogUpdateButtonLabel,
  getFollowButtonLabel,
  getNavItemRadiusClass,
  getStackedAvatarPositionClass,
  isNavigatorShareCancelled
} from '@/utils/displayFormat'
import { describe, expect, it } from 'vitest'

describe('displayFormat', () => {
  it('formatDisplayUsername adds @ when missing', () => {
    expect(formatDisplayUsername('jane')).toBe('@jane')
    expect(formatDisplayUsername('@jane')).toBe('@jane')
    expect(formatDisplayUsername(null)).toBe('')
  })

  it('formatSearchUserSubtitle includes bio preview', () => {
    expect(formatSearchUserSubtitle('@jane', null)).toBe('@jane')
    expect(formatSearchUserSubtitle('@jane', 'Hello world')).toBe(
      '@jane • Hello world'
    )
    expect(formatSearchUserSubtitle('@jane', 'x'.repeat(60))).toContain('...')
  })

  it('getFollowButtonLabel reflects state', () => {
    expect(getFollowButtonLabel(true, false)).toBe('Following')
    expect(getFollowButtonLabel(false, true)).toBe('Following...')
    expect(getFollowButtonLabel(false, false)).toBe('Follow')
  })

  it('getNavItemRadiusClass returns corner radii', () => {
    expect(getNavItemRadiusClass(true, false)).toBe('rounded-t-lg')
    expect(getNavItemRadiusClass(false, true)).toBe('rounded-b-lg')
    expect(getNavItemRadiusClass(false, false)).toBe('')
  })

  it('getStackedAvatarPositionClass positions avatars', () => {
    expect(getStackedAvatarPositionClass(0)).toBe('top-0 left-0 z-30')
    expect(getStackedAvatarPositionClass(1, 'sm')).toContain('left-4')
  })

  it('getBlogUpdateButtonLabel reflects loading and status', () => {
    expect(getBlogUpdateButtonLabel(true, 'draft')).toBe('Updating...')
    expect(getBlogUpdateButtonLabel(false, 'published')).toBe(
      'Update & Publish'
    )
    expect(getBlogUpdateButtonLabel(false, 'draft')).toBe('Update Draft')
  })

  it('isNavigatorShareCancelled detects AbortError', () => {
    expect(
      isNavigatorShareCancelled(new DOMException('aborted', 'AbortError'))
    ).toBe(true)
    expect(isNavigatorShareCancelled(new Error('fail'))).toBe(false)
  })

  it('formatUserPhotoAlt builds accessible label', () => {
    expect(formatUserPhotoAlt('Jane')).toBe("Jane's photo")
    expect(formatUserPhotoAlt('Jane', 'Doe')).toBe("Jane Doe's photo")
  })
})
