'use client'

import { FC, ReactNode } from 'react'
import { FaMedal, FaStar, FaTrophy } from 'react-icons/fa6'

interface Achievement {
  icon: ReactNode
  title: string
  description: string
}

const achievements: Achievement[] = [
  {
    icon: <FaMedal className="text-2xl text-yellow-500" />,
    title: 'First Post',
    description: 'Created your first post!'
  },
  {
    icon: <FaStar className="text-2xl text-blue-500" />,
    title: '100 Likes',
    description: 'Received 100 likes on your posts.'
  },
  {
    icon: <FaTrophy className="text-2xl text-green-500" />,
    title: 'Community Helper',
    description: 'Helped 10+ users.'
  }
]

const AchievementsBadges: FC = () => {
  return (
    <div className="mt-6 flex flex-col gap-y-4 border-t border-neutral-100 p-6">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Achievements & Badges
      </h2>
      <div className="flex flex-col gap-y-3">
        {achievements.map((ach, idx) => (
          <div key={idx} className="flex items-center gap-x-3">
            {ach.icon}
            <div>
              <div className="font-medium text-gray-800">{ach.title}</div>
              <div className="text-xs text-gray-500">{ach.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AchievementsBadges
