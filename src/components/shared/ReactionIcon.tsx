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
  onClick?: () => void | Promise<void>
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
      className={`text-xs text-pink-600 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={
        onClick
          ? () => {
              const result = onClick()
              if (result instanceof Promise) {
                result.catch(() => {})
              }
            }
          : undefined
      }
    />
  )
}

export default ReactionIcon
