import { useState } from 'react'
import { useReviews, useUpdateReview, useCreateReview } from '../hooks/useReviews'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import type { Review } from '../types/database'
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns'

export default function Reviews() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const [filter, setFilter] = useState<'pending' | 'done' | 'skipped'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    reviewDate: format(new Date(), 'yyyy-MM-dd'),
  })

  const { data: reviews, isLoading, error } = useReviews(filter)
  const { data: subjects } = useSubjects()
  const updateReview = useUpdateReview()
  const createReview = useCreateReview()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.topic.trim() || !formData.subjectId) return

    try {
      await createReview.mutateAsync({
        userId,
        subjectId: formData.subjectId,
        sessionId: null,
        topic: formData.topic,
        reviewDate: formData.reviewDate,
        status: 'pending',
      })
      setShowForm(false)
      setFormData({ subjectId: '', topic: '', reviewDate: format(new Date(), 'yyyy-MM-dd') })
    } catch (err) {
      console.error(err)
    }
  }

  const handleComplete = async (review: Review, intervalDays?: number) => {
    if (intervalDays && review.status === 'done') {
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + intervalDays)
      await updateReview.mutateAsync({
        id: review.id,
        updates: { reviewDate: format(newDate, 'yyyy-MM-dd'), status: 'pending' },
      })
    } else {
      await updateReview.mutateAsync({ id: review.id, updates: { status: 'done' } })
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Erro ao carregar revisões" />

  const groupedReviews = reviews?.reduce((acc, review) => {
    const dateKey = review.reviewDate.split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(review)
    return acc
  }, {} as Record<string, Review[]>)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Revisões</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nova Revisão
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'done', 'skipped'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            {f === 'pending' ? 'Pendentes' : f === 'done' ? 'Concluídas' : 'Puladas'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Revisão</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assunto *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Selecione...</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tópico *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filter === 'pending' && (
        <div className="space-y-6">
          {Object.keys(groupedReviews || {}).length === 0 ? (
            <p className="text-gray-500">Nenhuma revisão pendente!</p>
          ) : (
            Object.entries(groupedReviews || {})
              .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
              .map(([date, dateReviews]) => {
                const dateObj = parseISO(date)
                const isDatePast = isBefore(dateObj, startOfDay(new Date()))
                return (
                  <div key={date}>
                    <h3 className={`text-sm font-medium mb-2 ${isToday(dateObj) ? 'text-blue-600' : isDatePast ? 'text-red-600' : 'text-gray-600'}`}>
                      {isToday(dateObj) ? 'Hoje' : format(dateObj, 'dd/MM')}
                      {isDatePast && ' (atrasada)'}
                    </h3>
                    <div className="space-y-2">
                      {dateReviews?.map((review) => (
                        <div key={review.id} className="p-4 bg-white rounded-lg shadow border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{review.topic}</h4>
                              <p className="text-sm text-gray-500">{subjects?.find((s) => s.id === review.subjectId)?.name}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleComplete(review, 1)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded">+1 dia</button>
                              <button onClick={() => handleComplete(review, 7)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded">+7 dias</button>
                              <button onClick={() => handleComplete(review, 30)} className="px-3 py-1 bg-purple-100 text-purple-700 rounded">+30 dias</button>
                              <button onClick={() => handleComplete(review)} className="px-3 py-1 bg-green-100 text-green-700 rounded">Done</button>
                              <button onClick={() => updateReview.mutate({ id: review.id, updates: { status: 'skipped' } })} className="px-3 py-1 bg-gray-100 rounded">Pular</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      )}

      {filter !== 'pending' && (
        <div className="space-y-2">
          {reviews?.length === 0 ? (
            <p className="text-gray-500">Nenhuma revisão {filter === 'done' ? 'concluída' : 'pulada'}.</p>
          ) : (
            reviews?.map((review) => (
              <div key={review.id} className="p-4 bg-white rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{review.topic}</h4>
                    <p className="text-sm text-gray-500">{review.reviewDate ? format(new Date(review.reviewDate), 'dd/MM/yyyy') : ''}</p>
                  </div>
                  <button onClick={() => updateReview.mutate({ id: review.id, updates: { reviewDate: format(new Date(), 'yyyy-MM-dd'), status: 'pending' }})} className="text-sm text-blue-600">Reprogramar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}