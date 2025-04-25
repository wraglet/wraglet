import { FC } from 'react'

import ImageUploadCropModal from '@/app/(authenticated)/[username]/_components/ImageUploadCropModal'

const DEFAULT_COVER_PLACEHOLDER = `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/cover-photo-default.jpg`

interface UploadCoverPhotoProps {
  coverPhoto: string
  show: boolean
  close: () => void
  setCoverPhoto: (coverPhoto: string, e: any) => void
}

const UploadCoverPhoto: FC<UploadCoverPhotoProps> = ({
  coverPhoto,
  show,
  close,
  setCoverPhoto
}) => {
  return (
    <ImageUploadCropModal
      show={show}
      close={close}
      title="Upload Cover Photo"
      description={`Choose an image for your cover photo. For best results, use a wide image at least 1600x600 pixels.`}
      defaultImage={DEFAULT_COVER_PLACEHOLDER}
      image={coverPhoto}
      aspect={16 / 6}
      cropShape="rect"
      previewStyle="rect"
      minWidth={1600}
      minHeight={600}
      onCrop={setCoverPhoto}
      apiLabel="Save Cover Photo"
    />
  )
}

export default UploadCoverPhoto
