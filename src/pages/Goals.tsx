import { useState } from 'react'
import { useGoals, useCreateGoal, useUpdateGoal } from '../hooks/useGoals'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import type { Goal } from '../types/database'

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

  const getPeriod = (type: string) => {
    const now = new Date()
    if (type === 'daily') return { start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') }
    if (type === 'weekly') return { start: format(startOfWeek(now), 'yyyy-MM-dd'), end: format(endOfWeek(now), 'yyyy-MM-dd') }
    return { start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const period = getPeriod(formData.type)
    try {
      await createGoal.mutateAsync({
        user_id: userId,
        subject_id: formData.subjectId || null,
        type: formData.type,
        target_minutes: formData.targetMinutes,
        period_start: period.start,
        period_end: period.end,
        is_active: true,
      })
      setShowForm(false)
      setFormData({ subjectId: '', type: 'daily', targetMinutes: 60 })
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar metas." />

  const dailyGoals = goals?.filter((g) => g.type === 'daily') || []
  const weeklyGoals = goals?.filter((g) => g.type === 'weekly') || []
  const monthlyGoals = goals?.filter((g) => g.type === 'monthly') || []

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-label uppercase tracking-widest text-secondary mb-2 block">Painel de Análise</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Desempenho de Estudo</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="gold-accent text-on-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-xl shadow-secondary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low w-full max-w-lg rounded-xl border border-outline-variant/10 animate-scaleIn">
            <div className="p-8 border-b border-outline-variant/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label uppercase tracking-[0.15em] text-secondary mb-1">Nova Meta</p>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Configurar Meta</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Ciclo</label>
                <div className="flex gap-2 bg-surface-container-highest rounded-lg border border-outline-variant/10 p-1">
                  {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-3 text-[10px] font-label uppercase tracking-wider transition-all rounded-md ${
                        formData.type === t 
                          ? 'bg-surface-container-high text-on-surface shadow-sm' 
                          : 'text-outline hover:text-on-surface'
                      }`}
                    >
                      {t === 'daily' ? 'Diário' : t === 'weekly' ? 'Semanal' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Assunto</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Todos os assuntos</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Meta (minutos)</label>
                <input
                  type="number"
                  value={formData.targetMinutes}
                  onChange={(e) => setFormData({ ...formData, targetMinutes: parseInt(e.target.value) })}
                  className="input w-full"
                  min={1}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-surface-container-highest text-on-surface-variant text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 gold-accent text-on-secondary text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-label uppercase tracking-[0.3em] text-outline">Ciclo Diário</h3>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
          {dailyGoals.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-outline">Nenhuma meta diária definida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subject_id)} updateGoal={updateGoal} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-label uppercase tracking-[0.3em] text-outline">Ciclo Semanal</h3>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
          {weeklyGoals.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-outline">Nenhuma meta semanal definida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subject_id)} updateGoal={updateGoal} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-label uppercase tracking-[0.3em] text-outline">Ciclo Mensal</h3>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
          {monthlyGoals.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-outline">Nenhuma meta mensal definida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subject_id)} updateGoal={updateGoal} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function GoalCard({ goal, subject, updateGoal }: { goal: Goal; subject?: { name: string; color: string }; updateGoal: any }) {
  return (
    <div className="surface-card p-6 group hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: subject?.color || '#ADC7FF' }} />
            <h4 className="text-[10px] font-label uppercase tracking-[0.15em] text-on-surface-variant">
              {subject?.name || 'GLOBAL'}
            </h4>
          </div>
          <span className="text-[9px] font-mono text-outline uppercase tracking-wider">
            {goal.type === 'daily' ? 'Hoje' : goal.type === 'weekly' ? 'Esta semana' : 'Este mês'}
          </span>
        </div>
        <button
          onClick={() => updateGoal.mutate({ id: goal.id, updates: { is_active: !goal.is_active } })}
          className={`px-2.5 py-1 text-[9px] font-label uppercase tracking-wider rounded-md transition-all ${
            goal.is_active 
              ? 'bg-primary/10 text-primary' 
              : 'bg-surface-container-highest text-outline'
          }`}
        >
          {goal.is_active ? 'Ativo' : 'Pausado'}
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-label text-outline uppercase tracking-wider">Progresso calculado ao final de cada sessão</span>
          </div>
        </div>
        
        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div 
            className="h-full flow-gradient rounded-full transition-all duration-1000" 
            style={{ width: '0%' }} 
          />
        </div>
      </div>
    </div>
  )
}