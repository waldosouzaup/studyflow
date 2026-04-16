import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

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
    mutationFn: (session: { user_id: string; subject_id: string; date: string; started_at: string; finished_at: string | null; paused_at: string | null; duration_minutes: number; topic: string | null; notes: string | null; difficulty: number | null; focus: number | null; session_type: 'free' | 'pomodoro'; is_offline_sync: boolean }) => sessionApi.create(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
      queryClient.invalidateQueries({ queryKey: ['activeSession', userId] })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { finished_at?: string | null; paused_at?: string | null; duration_minutes?: number; topic?: string | null; notes?: string | null; difficulty?: number | null; focus?: number | null } }) =>
      sessionApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId] })
      queryClient.invalidateQueries({ queryKey: ['activeSession', userId] })
    },
  })
}

export function useActiveSession() {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery<any>({
    queryKey: ['activeSession', userId],
    queryFn: () => sessionApi.getActive(userId!),
    enabled: !!userId,
  })
}

export function useSessionsByDateRange(from: string, to: string) {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: ['sessions-range', userId, from, to],
    queryFn: () => sessionApi.listByDateRange(userId!, from, to),
    enabled: !!userId && !!from && !!to,
    staleTime: 10 * 60 * 1000,
  })
}