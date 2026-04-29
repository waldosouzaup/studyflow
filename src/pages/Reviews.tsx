import { useState } from 'react'
import { useReviews, useUpdateReview, useCreateReview } from '../hooks/useReviews'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import type { Review } from '../types/database'
import { format, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clsx from 'clsx'

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
        user_id: userId, subject_id: formData.subjectId, session_id: null,
        topic: formData.topic, review_date: formData.reviewDate, status: 'pending',
      })
      setShowForm(false)
      setFormData({ subjectId: '', topic: '', reviewDate: format(new Date(), 'yyyy-MM-dd') })
    } catch (err) { console.error(err) }
  }

  const handleComplete = async (review: Review, intervalDays?: number) => {
    if (intervalDays) {
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + intervalDays)
      await updateReview.mutateAsync({ id: review.id, updates: { review_date: format(newDate, 'yyyy-MM-dd'), status: 'pending' } })
    } else {
      await updateReview.mutateAsync({ id: review.id, updates: { status: 'done' } })
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar revisões." />

  const groupedReviews = reviews?.reduce((acc, review) => {
    const dateKey = review.review_date.split('T')[0]
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(review)
    return acc
  }, {} as Record<string, Review[]>)

  const overdueCount = filter === 'pending'
    ? reviews?.filter(r => isBefore(parseISO(r.review_date.split('T')[0]), startOfDay(new Date()))).length || 0
    : 0

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-muted)]">Retenção</span>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Revisões</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Revisão
        </button>
      </div>

      {/* Filter + Overdue alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-[var(--bg-elevated)] p-1 rounded-card border border-[var(--border)]">
          {(['pending', 'done', 'skipped'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 text-xs font-label uppercase tracking-wider rounded-sharp transition-all',
                filter === f ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
              {f === 'pending' ? 'Ativas' : f === 'done' ? 'Concluídas' : 'Puladas'}
            </button>
          ))}
        </div>
        {overdueCount > 0 && (
          <span className="badge badge-danger text-[10px]">
            {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-label uppercase tracking-[0.12em] text-accent">Nova</span>
                  <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Revisão</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-card text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Assunto *</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="input w-full" required>
                  <option value="">Selecionar...</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Tópico *</label>
                <input type="text" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="input w-full" placeholder="Ex: Teorema de Green" required />
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Data</label>
                <input type="date" value={formData.reviewDate} onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })} className="input w-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2.5 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-accent py-2.5 text-sm font-semibold">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending reviews grouped by date */}
      {filter === 'pending' && (
        <div className="space-y-6">
          {Object.keys(groupedReviews || {}).length === 0 ? (
            <div className="card p-10 text-center text-sm text-[var(--text-muted)]">
              Nenhuma revisão pendente. Ótimo trabalho! 🎉
            </div>
          ) : (
            Object.entries(groupedReviews || {})
              .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
              .map(([date, dateReviews]) => {
                const dateObj = parseISO(date)
                const isDatePast = isBefore(dateObj, startOfDay(new Date()))
                return (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={clsx('text-[10px] font-label uppercase tracking-[0.15em] font-semibold',
                        isToday(dateObj) ? 'text-accent' : isDatePast ? 'text-danger' : 'text-[var(--text-muted)]')}>
                        {isToday(dateObj) ? 'Hoje' : format(dateObj, "EEE, d MMM", { locale: ptBR })}
                        {isDatePast && ' · Atrasado'}
                      </span>
                      <div className="flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <div className="space-y-1.5">
                      {dateReviews?.map((review) => (
                        <div key={review.id} className="card p-4 group hover:border-accent/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjects?.find(s => s.id === review.subject_id)?.color }} />
                                <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">
                                  {subjects?.find((s) => s.id === review.subject_id)?.name || 'Sem vínculo'}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-accent transition-colors">{review.topic}</h4>
                            </div>

                            <div className="flex flex-wrap gap-1.5 shrink-0">
                              <button onClick={() => handleComplete(review, 1)} className="px-3 py-1.5 text-[10px] font-label uppercase tracking-wider rounded-card border border-[var(--border)] text-[var(--text-muted)] hover:border-accent hover:text-accent transition-all">+1 dia</button>
                              <button onClick={() => handleComplete(review, 7)} className="px-3 py-1.5 text-[10px] font-label uppercase tracking-wider rounded-card border border-[var(--border)] text-[var(--text-muted)] hover:border-accent hover:text-accent transition-all">+7 dias</button>
                              <button onClick={() => handleComplete(review)} className="px-3 py-1.5 text-[10px] font-label uppercase tracking-wider rounded-card btn-accent">Concluir</button>
                              <button onClick={() => updateReview.mutate({ id: review.id, updates: { status: 'skipped' } })} className="px-3 py-1.5 text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] hover:text-danger transition-colors">Pular</button>
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

      {/* Done/Skipped list */}
      {filter !== 'pending' && (
        <div className="space-y-1.5">
          {reviews?.length === 0 ? (
            <div className="card p-10 text-center text-sm text-[var(--text-muted)]">Nenhum registro nesta categoria.</div>
          ) : (
            reviews?.map((review) => (
              <div key={review.id} className="card p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{review.topic}</h4>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      {review.review_date ? format(new Date(review.review_date), "dd MMM yyyy", { locale: ptBR }) : '---'}
                    </span>
                  </div>
                  <button
                    onClick={() => updateReview.mutate({ id: review.id, updates: { review_date: format(new Date(), 'yyyy-MM-dd'), status: 'pending' } })}
                    className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] hover:text-accent transition-colors"
                  >
                    Reprogramar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}