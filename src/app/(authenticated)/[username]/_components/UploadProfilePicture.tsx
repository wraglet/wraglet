import { FC } from 'react'
import useUserStore from '@/store/user'

import ImageUploadCropModal from '@/app/(authenticated)/[username]/_components/ImageUploadCropModal'

const DEFAULT_MALE = `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/male-placeholder.png`
const DEFAULT_FEMALE = `${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/placeholder/female-placeholder.png`

interface Props {
  profilePicture: string
  show: boolean
  close: () => void
  setProfilePicture: (profilePicture: string, e: any) => void
}

const UploadProfilePicture: FC<Props> = ({
  profilePicture,
  show,
  close,
  setProfilePicture
}) => {
  const gender = useUserStore((state: any) => state.user?.gender)
  const defaultProfilePictureUrl =
    gender === 'Male' ? DEFAULT_MALE : DEFAULT_FEMALE

  return (
    <ImageUploadCropModal
      show={show}
      close={close}
      title="Upload Profile Picture"
      description="Choose an image for your profile picture. Max size: 4MB."
      defaultImage={defaultProfilePictureUrl}
      image={profilePicture}
      aspect={1}
      cropShape="round"
      previewStyle="circle"
      minWidth={160}
      minHeight={160}
      onCrop={setProfilePicture}
      apiLabel="Save Profile Picture"
    />
  )
}

export default UploadProfilePicture
