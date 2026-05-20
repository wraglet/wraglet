import { FaMedal, FaStar, FaTrophy } from 'react-icons/fa6'

import {
  achievementMedalIconClassName,
  achievementStarIconClassName,
  achievementTrophyIconClassName
} from '@/components/profile/achievementsBadgesClassNames'

type AchievementIconVariant = 'medal' | 'star' | 'trophy'

interface AchievementIconProps {
  variant: AchievementIconVariant
}

const AchievementIcon = ({ variant }: AchievementIconProps) => {
  switch (variant) {
    case 'medal':
      return <FaMedal className={achievementMedalIconClassName} />
    case 'star':
      return <FaStar className={achievementStarIconClassName} />
    case 'trophy':
      return <FaTrophy className={achievementTrophyIconClassName} />
    default:
      return null
  }
}

export default AchievementIcon
