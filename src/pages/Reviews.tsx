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
        user_id: userId,
        subject_id: formData.subjectId,
        session_id: null,
        topic: formData.topic,
        review_date: formData.reviewDate,
        status: 'pending',
      })
      setShowForm(false)
      setFormData({ subjectId: '', topic: '', reviewDate: format(new Date(), 'yyyy-MM-dd') })
    } catch (err) {
      console.error(err)
    }
  }

  const handleComplete = async (review: Review, intervalDays?: number) => {
    if (intervalDays) {
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + intervalDays)
      await updateReview.mutateAsync({
        id: review.id,
        updates: { review_date: format(newDate, 'yyyy-MM-dd'), status: 'pending' },
      })
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-label uppercase tracking-widest text-primary mb-2 block">Retenção</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Revisões Espaçadas</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto justify-center gold-accent text-on-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-xl shadow-secondary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Revisão
        </button>
      </div>

      <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/10 self-start">
        {(['pending', 'done', 'skipped'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-5 py-2 text-xs font-label uppercase tracking-wider transition-all rounded-md',
              filter === f ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'
            )}
          >
            {f === 'pending' ? 'Ativas' : f === 'done' ? 'Concluídas' : 'Puladas'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low w-full max-w-lg rounded-xl border border-outline-variant/10 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-outline-variant/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label uppercase tracking-[0.15em] text-primary mb-1">Nova Revisão</p>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Agendar Revisão</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Assunto *</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Selecionar...</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Tópico *</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="input w-full"
                  placeholder="Ex: Teorema de Green"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Data</label>
                <input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-surface-container-highest text-on-surface-variant text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 flow-gradient text-on-primary text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-all">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filter === 'pending' && (
        <div className="space-y-8">
          {Object.keys(groupedReviews || {}).length === 0 ? (
            <div className="surface-card p-16 text-center">
              <p className="text-outline">Nenhuma revisão pendente. Ótimo trabalho!</p>
            </div>
          ) : (
            Object.entries(groupedReviews || {})
              .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
              .map(([date, dateReviews]) => {
                const dateObj = parseISO(date)
                const isDatePast = isBefore(dateObj, startOfDay(new Date()))
                return (
                  <div key={date}>
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className={clsx(
                        'text-[10px] font-label uppercase tracking-[0.2em]',
                        isToday(dateObj) ? 'text-primary' : isDatePast ? 'text-error' : 'text-on-surface-variant'
                      )}>
                        {isToday(dateObj) ? 'Hoje' : format(dateObj, "EEE, d MMM", { locale: ptBR })}
                        {isDatePast && ' (Atrasado)'}
                      </h3>
                      <div className="flex-1 h-px bg-outline-variant/30" />
                    </div>
                    
                    <div className="space-y-2">
                      {dateReviews?.map((review) => (
                        <div key={review.id} className="surface-card p-4 group hover:bg-surface-container transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjects?.find(s => s.id === review.subject_id)?.color }} />
                                <span className="text-[10px] font-label uppercase tracking-wider text-outline">
                                  {subjects?.find((s) => s.id === review.subject_id)?.name || 'Sem vínculo'}
                                </span>
                              </div>
                              <h4 className="text-base font-medium text-on-surface group-hover:text-primary transition-colors">{review.topic}</h4>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleComplete(review, 1)} className="px-3 py-1.5 bg-surface-container-highest text-[10px] font-label uppercase tracking-wider text-outline hover:text-on-surface rounded-lg transition-all">+1 dia</button>
                              <button onClick={() => handleComplete(review, 7)} className="px-3 py-1.5 bg-surface-container-highest text-[10px] font-label uppercase tracking-wider text-outline hover:text-on-surface rounded-lg transition-all">+7 dias</button>
                              <button onClick={() => handleComplete(review)} className="px-4 py-1.5 flow-gradient text-on-primary text-[10px] font-label uppercase tracking-wider rounded-lg">Concluir</button>
                              <button onClick={() => updateReview.mutate({ id: review.id, updates: { status: 'skipped' } })} className="px-3 py-1.5 text-[10px] font-label uppercase tracking-wider text-outline hover:text-error transition-colors">Pular</button>
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
            <div className="surface-card p-12 text-center">
              <p className="text-outline">Nenhum registro nesta categoria.</p>
            </div>
          ) : (
            reviews?.map((review) => (
              <div key={review.id} className="surface-card p-4 transition-all opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-on-surface mb-1">{review.topic}</h4>
                    <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                      {review.review_date ? format(new Date(review.review_date), "dd MMM yyyy", { locale: ptBR }) : '---'}
                    </span>
                  </div>
                  <button 
                    onClick={() => updateReview.mutate({ id: review.id, updates: { review_date: format(new Date(), 'yyyy-MM-dd'), status: 'pending' }})} 
                    className="text-[10px] font-label uppercase tracking-wider text-outline hover:text-primary transition-colors"
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