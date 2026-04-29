import { useState, useMemo } from 'react'
import { useGoals, useCreateGoal, useUpdateGoal } from '../hooks/useGoals'
import { useSubjects } from '../hooks/useSubjects'
import { useSessionsByDateRange } from '../hooks/useSessions'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Goal } from '../types/database'
import clsx from 'clsx'

export default function Goals() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subjectId: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    targetMinutes: 60,
  })

  const { data: goals, isLoading, error } = useGoals()
  const { data: subjects } = useSubjects()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const { data: periodSessions } = useSessionsByDateRange(monthStart, monthEnd)

  const getPeriod = (type: string) => {
    const now = new Date()
    if (type === 'daily') return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
    if (type === 'weekly') return { start: format(startOfWeek(now), 'yyyy-MM-dd'), end: format(endOfWeek(now), 'yyyy-MM-dd') }
    return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') }
  }

  const goalProgress = useMemo(() => {
    if (!goals || !periodSessions) return new Map<string, number>()
    const progressMap = new Map<string, number>()
    goals.forEach((goal) => {
      const periodStart = goal.period_start.split('T')[0]
      const periodEnd = goal.period_end.split('T')[0]
      const matchingSessions = periodSessions.filter((s) => {
        const sessionDate = s.date.split('T')[0]
        return sessionDate >= periodStart && sessionDate <= periodEnd && (!goal.subject_id || s.subject_id === goal.subject_id)
      })
      progressMap.set(goal.id, matchingSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0))
    })
    return progressMap
  }, [goals, periodSessions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const period = getPeriod(formData.type)
    try {
      await createGoal.mutateAsync({
        user_id: userId, subject_id: formData.subjectId || null,
        type: formData.type, target_minutes: formData.targetMinutes,
        period_start: period.start, period_end: period.end, is_active: true,
      })
      setShowForm(false)
      setFormData({ subjectId: '', type: 'daily', targetMinutes: 60 })
    } catch (err) { console.error(err) }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar metas." />

  const dailyGoals = goals?.filter((g) => g.type === 'daily') || []
  const weeklyGoals = goals?.filter((g) => g.type === 'weekly') || []
  const monthlyGoals = goals?.filter((g) => g.type === 'monthly') || []

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-muted)]">Desempenho</span>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Metas</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nova Meta
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-label uppercase tracking-[0.12em] text-gold">Nova</span>
                  <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Meta</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-card text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-2">Ciclo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })}
                      className={clsx('py-2.5 text-xs font-medium rounded-card border transition-all',
                        formData.type === t ? 'bg-[var(--gold-muted)] text-gold border-gold/30' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]')}>
                      {t === 'daily' ? 'Diário' : t === 'weekly' ? 'Semanal' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Assunto</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="input w-full">
                  <option value="">Todos os assuntos</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Meta (minutos)</label>
                <input type="number" value={formData.targetMinutes} onChange={(e) => setFormData({ ...formData, targetMinutes: parseInt(e.target.value) })} className="input w-full" min={1} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2.5 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-gold py-2.5 text-sm font-semibold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: 'Diário', goals: dailyGoals },
          { label: 'Semanal', goals: weeklyGoals },
          { label: 'Mensal', goals: monthlyGoals },
        ].map(({ label, goals: sectionGoals }) => (
          <section key={label} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-label uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold">{label}</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            {sectionGoals.length === 0 ? (
              <div className="card p-6 text-center text-sm text-[var(--text-muted)]">Nenhuma meta definida.</div>
            ) : (
              sectionGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subject_id)} updateGoal={updateGoal} actualMinutes={goalProgress.get(goal.id) || 0} />
              ))
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

function GoalCard({ goal, subject, updateGoal, actualMinutes }: { goal: Goal; subject?: { name: string; color: string }; updateGoal: any; actualMinutes: number }) {
  const progressPct = Math.min((actualMinutes / goal.target_minutes) * 100, 100)
  const isCompleted = progressPct >= 100
  const actualHours = Math.floor(actualMinutes / 60)
  const actualMins = actualMinutes % 60
  const targetHours = Math.floor(goal.target_minutes / 60)
  const targetMins = goal.target_minutes % 60

  return (
    <div className={clsx('card p-5 transition-all', isCompleted && 'border-gold/30')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-sharp" style={{ backgroundColor: subject?.color || 'var(--accent)' }} />
          <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {subject?.name || 'GLOBAL'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && <span className="badge badge-gold text-[8px]">✓ Meta</span>}
          <button
            onClick={() => updateGoal.mutate({ id: goal.id, updates: { is_active: !goal.is_active } })}
            className={clsx('px-2 py-1 text-[9px] font-label uppercase tracking-wider rounded-sharp transition-all',
              goal.is_active ? 'bg-[var(--accent-muted)] text-accent' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]')}>
            {goal.is_active ? 'Ativo' : 'Pausado'}
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-display font-bold text-[var(--text-primary)]">
            {actualHours > 0 ? `${actualHours}h` : ''}{actualMins > 0 ? `${actualMins}m` : actualHours === 0 ? '0m' : ''}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            / {targetHours > 0 ? `${targetHours}h` : ''}{targetMins > 0 ? `${targetMins}m` : ''}
          </span>
        </div>
        <span className={clsx('text-sm font-display font-bold', isCompleted ? 'text-gold' : 'text-accent')}>
          {Math.round(progressPct)}%
        </span>
      </div>

      <div className="progress-bar">
        <div className={clsx('progress-bar-fill', isCompleted && 'gold')} style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  )
}