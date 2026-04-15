import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function useSubjects() {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['subjects', userId],
    queryFn: () => subjectApi.list(userId!),
    enabled: !!userId,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (subject: { user_id: string; name: string; color: string; weekly_goal_hours: number | null; monthly_goal_hours: number | null }) =>
      subjectApi.create(subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', userId] })
    },
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name: string; color: string; weekly_goal_hours: number | null; monthly_goal_hours: number | null } }) =>
      subjectApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', userId] })
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (id: string) => subjectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', userId] })
    },
  })
}