import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import type { StudySession } from '../types/database'

export function useSessions(from?: string, to?: string, subjectId?: string) {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['sessions', userId, from, to, subjectId],
    queryFn: () => sessionApi.list(userId!, from, to, subjectId),
    enabled: !!userId,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (session: Omit<StudySession, 'id' | 'createdAt'>) => sessionApi.create(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<StudySession> }) =>
      sessionApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
    },
  })
}

export function useActiveSession() {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['activeSession', userId],
    queryFn: () => sessionApi.getActive(userId!),
    enabled: !!userId,
  })
}