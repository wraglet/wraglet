import { IconType } from 'react-icons'
import {
  FaRegThumbsUp,
  FaRegHeart,
  FaRegFaceGrinTears,
  FaRegFaceSurprise,
  FaRegFaceSadTear,
  FaRegFaceAngry
} from 'react-icons/fa6'

type Props = {
  type: string
  onClick: () => Promise<void>
}

const ReactionIcon = ({ type, onClick }: Props) => {
  const selectedIcons: { [key: string]: IconType } = {
    like: FaRegThumbsUp,
    love: FaRegHeart,
    haha: FaRegFaceGrinTears,
    wow: FaRegFaceSurprise,
    sad: FaRegFaceSadTear,
    angry: FaRegFaceAngry
  }

  const SelectedIcon = selectedIcons[type] || FaRegHeart

  return (
    <SelectedIcon
      className='text-xs text-pink-600 cursor-pointer'
      onClick={onClick}
    />
  )
}

export default ReactionIcon
