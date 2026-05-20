'use client'

import AchievementIcon from '@/components/profile/AchievementIcon'
import {
  achievementsBadgesDescriptionClassName,
  achievementsBadgesListClassName,
  achievementsBadgesNameClassName,
  achievementsBadgesRootClassName,
  achievementsBadgesRowClassName,
  achievementsBadgesTitleClassName
} from '@/components/profile/achievementsBadgesClassNames'

const ACHIEVEMENTS = [
  {
    id: 'first-post',
    variant: 'medal' as const,
    title: 'First Post',
    description: 'Created your first post!'
  },
  {
    id: '100-likes',
    variant: 'star' as const,
    title: '100 Likes',
    description: 'Received 100 likes on your posts.'
  },
  {
    id: 'community-helper',
    variant: 'trophy' as const,
    title: 'Community Helper',
    description: 'Helped 10+ users.'
  }
]

const AchievementsBadges = () => (
  <div className={achievementsBadgesRootClassName}>
    <h2 className={achievementsBadgesTitleClassName}>
      Achievements and Badges
    </h2>
    <div className={achievementsBadgesListClassName}>
      {ACHIEVEMENTS.map((achievement) => (
        <div key={achievement.id} className={achievementsBadgesRowClassName}>
          <AchievementIcon variant={achievement.variant} />
          <div>
            <div className={achievementsBadgesNameClassName}>
              {achievement.title}
            </div>
            <p className={achievementsBadgesDescriptionClassName}>
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default AchievementsBadges
