import { IconType } from 'react-icons'
import {
  FaRegFaceAngry,
  FaRegFaceGrinTears,
  FaRegFaceSadTear,
  FaRegFaceSurprise,
  FaRegHeart,
  FaRegThumbsUp
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
      className="cursor-pointer text-xs text-pink-600"
      onClick={onClick}
    />
  )
}

export default ReactionIcon
