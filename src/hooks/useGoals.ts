import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { Goal } from '../types/database'

export function useGoals() {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['goals', userId],
    queryFn: () => goalApi.list(userId!),
    enabled: !!userId,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (goal: Omit<Goal, 'id' | 'createdAt'>) => goalApi.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
    },
  })
}