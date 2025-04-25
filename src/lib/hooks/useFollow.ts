import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useFollow = (targetUserId: string | null) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  // Fetch follow state and counts for the target user
  const {
    data: followData,
    isLoading: isFollowLoading,
    refetch: refetchFollow
  } = useQuery({
    queryKey: ['followState', targetUserId],
    queryFn: async () => {
      if (!targetUserId)
        return { followersCount: 0, followingCount: 0, isFollowing: false }
      const res = await fetch(`/api/follows?userId=${targetUserId}`)
      if (!res.ok) throw new Error('Failed to fetch follow state')
      return res.json()
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Mutation for following
  const followMutation = useMutation({
    mutationFn: async () => {
      setLoading(true)
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })
      setLoading(false)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to follow')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followState', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['followingIds'] })
    }
  })

  // Mutation for unfollowing
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      setLoading(true)
      const res = await fetch('/api/follows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      })
      setLoading(false)
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to unfollow')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followState', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['followingIds'] })
    }
  })

  return {
    isFollowing: !!followData?.isFollowing,
    followersCount: followData?.followersCount ?? 0,
    followingCount: followData?.followingCount ?? 0,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    loading:
      loading ||
      isFollowLoading ||
      followMutation.isPending ||
      unfollowMutation.isPending,
    refetch: refetchFollow
  }
}
