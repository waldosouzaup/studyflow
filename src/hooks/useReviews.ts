import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

export function useReviews(status?: string) {
  const userId = useAuthStore((s) => s.user?.id)
  
  return useQuery({
    queryKey: ['reviews', userId, status],
    queryFn: () => reviewApi.list(userId!, status),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: (review: { user_id: string; subject_id: string; session_id: string | null; topic: string; review_date: string; status: 'pending' | 'done' | 'skipped' }) => reviewApi.create(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', userId] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { subject_id?: string; session_id?: string | null; topic?: string; review_date?: string; status?: 'pending' | 'done' | 'skipped' } }) =>
      reviewApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', userId] })
    },
  })
}