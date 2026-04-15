import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

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
    mutationFn: (goal: { user_id: string; subject_id: string | null; type: 'daily' | 'weekly' | 'monthly'; target_minutes: number; period_start: string; period_end: string; is_active: boolean }) => goalApi.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { subject_id?: string | null; type?: 'daily' | 'weekly' | 'monthly'; target_minutes?: number; period_start?: string; period_end?: string; is_active?: boolean } }) =>
      goalApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] })
    },
  })
}