import { useState } from 'react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clsx from 'clsx'

export default function Plans() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const today = format(new Date(), 'yyyy-MM-dd')
  const [view, setView] = useState<'today' | 'week'>('today')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ task: '', subjectId: '', priority: 'medium' as 'low' | 'medium' | 'high', estimatedMinutes: 30, date: today })

  const { data: subjects } = useSubjects()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const dateFrom = view === 'today' ? today : weekStart
  const dateTo = view === 'today' ? today : weekEnd
  const { data: plans, isLoading, error } = usePlans(dateFrom, dateTo)
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.task.trim()) return
    try {
      await createPlan.mutateAsync({
        user_id: userId, task: formData.task, subject_id: formData.subjectId || null,
        priority: formData.priority, estimated_minutes: formData.estimatedMinutes, status: 'pending',
        date: formData.date,
      })
      setShowForm(false)
      setFormData({ task: '', subjectId: '', priority: 'medium', estimatedMinutes: 30, date: today })
    } catch { console.error('Erro ao criar tarefa') }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar planos." />

  const donePlans = plans?.filter(p => p.status === 'done').length || 0
  const totalPlans = plans?.length || 0
  const progressPct = totalPlans ? Math.round((donePlans / totalPlans) * 100) : 0

  // Group by date for week view
  const plansByDate: Record<string, typeof plans> = {}
  if (view === 'week' && plans) {
    plans.forEach(p => {
      const dateKey = p.date?.split('T')[0] || today
      if (!plansByDate[dateKey]) plansByDate[dateKey] = []
      plansByDate[dateKey]!.push(p)
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-muted)]">Organização</span>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Planejamento</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Tarefa
        </button>
      </div>

      {/* View toggle + Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-[var(--bg-elevated)] p-1 rounded-card border border-[var(--border)]">
          {(['today', 'week'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={clsx('px-4 py-2 text-xs font-label uppercase tracking-wider rounded-sharp transition-all', view === v ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
              {v === 'today' ? 'Hoje' : 'Semana'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="progress-bar w-24 sm:w-32">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-label text-[var(--text-muted)]">{donePlans}/{totalPlans}</span>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-label uppercase tracking-[0.12em] text-accent">Nova</span>
                  <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Tarefa</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-card text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Tarefa *</label>
                <input type="text" value={formData.task} onChange={(e) => setFormData({ ...formData, task: e.target.value })} className="input w-full" placeholder="O que você precisa fazer?" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Assunto</label>
                  <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="input w-full">
                    <option value="">Geral</option>
                    {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Tempo (min)</label>
                  <input type="number" value={formData.estimatedMinutes} onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })} className="input w-full" min={5} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-2">Prioridade</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })}
                      className={clsx('py-2 text-xs font-medium rounded-card border transition-all', formData.priority === p
                        ? p === 'low' ? 'bg-accent/10 text-accent border-accent/30' : p === 'medium' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-danger/10 text-danger border-danger/30'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]')}>
                      {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Data</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input w-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2.5 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-accent py-2.5 text-sm font-semibold">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Today View ─── */}
      {view === 'today' && (
        <div className="space-y-1.5">
          {plans?.map((plan) => (
            <PlanItem key={plan.id} plan={plan} subjects={subjects} updatePlan={updatePlan} deletePlan={deletePlan} />
          ))}
          {(!plans || plans.length === 0) && (
            <div className="card p-10 text-center text-sm text-[var(--text-muted)]">Nenhuma tarefa para hoje</div>
          )}
        </div>
      )}

      {/* ─── Week View ─── */}
      {view === 'week' && (
        <div className="space-y-6">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayPlans = plansByDate[dateKey] || []
            const isToday = dateKey === today
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={clsx('text-[10px] font-label uppercase tracking-[0.15em]', isToday ? 'text-accent font-semibold' : 'text-[var(--text-muted)]')}>
                    {format(date, 'EEE, d MMM', { locale: ptBR })}
                    {isToday && ' (Hoje)'}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-[10px] text-[var(--text-muted)]">{dayPlans.filter(p => p.status === 'done').length}/{dayPlans.length}</span>
                </div>
                <div className="space-y-1">
                  {dayPlans.map(plan => (
                    <PlanItem key={plan.id} plan={plan} subjects={subjects} updatePlan={updatePlan} deletePlan={deletePlan} />
                  ))}
                  {dayPlans.length === 0 && <div className="text-[11px] text-[var(--text-muted)] py-2 pl-2">—</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlanItem({ plan, subjects, updatePlan, deletePlan }: { plan: any; subjects: any; updatePlan: any; deletePlan: any }) {
  const subject = subjects?.find((s: any) => s.id === plan.subject_id)
  return (
    <div className={clsx('flex items-center gap-3 p-3 rounded-card hover:bg-[var(--bg-subtle)] transition-colors group', plan.status === 'done' && 'opacity-50')}>
      <button
        onClick={() => updatePlan.mutate({ id: plan.id, updates: { status: plan.status === 'done' ? 'pending' : 'done' } })}
        className={clsx('w-[18px] h-[18px] rounded-sharp border flex items-center justify-center shrink-0 transition-all',
          plan.status === 'done' ? 'bg-accent border-accent' : 'border-[var(--border)] hover:border-accent')}
      >
        {plan.status === 'done' && <span className="material-symbols-outlined text-[12px] text-[var(--text-inverted)]">check</span>}
      </button>
      {subject && <div className="w-1 h-5 rounded-sharp shrink-0" style={{ backgroundColor: subject.color }} />}
      <div className="flex-1 min-w-0">
        <span className={clsx('text-sm', plan.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]')}>
          {plan.task}
        </span>
        {plan.estimated_minutes && <span className="text-[10px] text-[var(--text-muted)] ml-2">{plan.estimated_minutes}min</span>}
      </div>
      {plan.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />}
      <button onClick={() => deletePlan.mutate(plan.id)}
        className="p-1.5 rounded-card hover:bg-[var(--danger-muted)] transition-colors opacity-0 group-hover:opacity-100">
        <span className="material-symbols-outlined text-[14px] text-danger">close</span>
      </button>
    </div>
  )
}