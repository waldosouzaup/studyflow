import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { Plan } from '../types/database'

export function usePlans(date?: string) {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['plans', userId, date],
    queryFn: () => planApi.list(userId!, date),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (plan: Omit<Plan, 'id' | 'createdAt'>) => planApi.create(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', userId] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Plan> }) =>
      planApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', userId] })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (id: string) => planApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', userId] })
    },
  })
}