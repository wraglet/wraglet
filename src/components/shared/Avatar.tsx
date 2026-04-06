import Image from 'next/image'
import { Gender } from '@/interfaces'

import { DEFAULT_GENDER } from '@/data/constants'

type AvatarProps = {
  gender: Gender
  size?: string
  className?: string
  alt?: string
  /** Remote image URL, or null/undefined to use gender placeholder */
  src?: string | null
}

const placeholderForGender = (gender: Gender) =>
  `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/${gender.toLowerCase().replace(/\s+/g, '-')}-placeholder.png`

/** Next/Image must not receive "", non-strings, or empty objects as src */
const resolveAvatarSrc = (raw: unknown, placeholder: string): string => {
  if (raw == null) return placeholder
  if (typeof raw !== 'string') return placeholder
  const trimmed = raw.trim()
  if (trimmed.length === 0) return placeholder
  return trimmed
}

const Avatar = ({
  gender,
  size = 'h-9 w-9',
  className,
  alt,
  src
}: AvatarProps) => {
  const safeGender = gender || DEFAULT_GENDER
  const placeholder = placeholderForGender(safeGender)
  const imageSrc = resolveAvatarSrc(src, placeholder)

  return (
    <div
      className={`relative block rounded-full border border-solid border-neutral-200 ${className} ${size}`}
    >
      <Image
        className="rounded-full object-cover"
        fill
        sizes="160px"
        src={imageSrc}
        alt={alt ?? 'Avatar'}
      />
    </div>
  )
}

export default Avatar
