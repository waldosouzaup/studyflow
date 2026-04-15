import { useState } from 'react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import type { Plan } from '../types/database'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clsx from 'clsx'

export default function Plans() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const [view, setView] = useState<'today' | 'week'>('today')
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    task: '',
    subject_id: '',
    planned_date: new Date().toISOString().split('T')[0],
    estimated_minutes: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const { data: plans, isLoading, error } = usePlans(view === 'today' ? todayStr : undefined)
  const { data: subjects } = useSubjects()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.task.trim()) return

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({
          id: editingPlan.id,
          updates: {
            task: formData.task,
            subject_id: formData.subject_id || null,
            planned_date: formData.planned_date,
            estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
            priority: formData.priority,
          },
        })
      } else {
        await createPlan.mutateAsync({
          user_id: userId,
          subject_id: formData.subject_id || null,
          planned_date: formData.planned_date,
          task: formData.task,
          estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
          priority: formData.priority,
          status: 'pending',
          is_overdue: false,
        })
      }
      resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      task: plan.task,
      subject_id: plan.subject_id || '',
      planned_date: plan.planned_date.split('T')[0],
      estimated_minutes: plan.estimated_minutes?.toString() || '',
      priority: plan.priority,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir tarefa?')) {
      await deletePlan.mutateAsync(id)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingPlan(null)
    setFormData({
      task: '',
      subject_id: '',
      planned_date: new Date().toISOString().split('T')[0],
      estimated_minutes: '',
      priority: 'medium',
    })
  }

  const getPlansForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return plans?.filter((p) => p.planned_date.split('T')[0] === dateStr) || []
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar planos." />

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-label uppercase tracking-widest text-primary mb-2 block">Planejamento</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Plano de Hoje</h1>
        </div>
        <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
          <button
            onClick={() => setView('today')}
            className={clsx(
              'px-5 py-2 text-xs font-label uppercase tracking-wider transition-all rounded-md',
              view === 'today' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'
            )}
          >
            Hoje
          </button>
          <button
            onClick={() => setView('week')}
            className={clsx(
              'px-5 py-2 text-xs font-label uppercase tracking-wider transition-all rounded-md',
              view === 'week' ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'
            )}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <button
          onClick={() => setShowForm(true)}
          className="flow-gradient text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all self-start flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Tarefa
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
            <div className="bg-surface-container-low w-full max-w-lg rounded-xl border border-outline-variant/10 animate-scaleIn">
              <div className="p-8 border-b border-outline-variant/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-label uppercase tracking-[0.15em] text-primary mb-1">Dados da Tarefa</p>
                    <h2 className="text-2xl font-headline font-bold text-on-surface">
                      {editingPlan ? 'Editar' : 'Nova'} Tarefa
                    </h2>
                  </div>
                  <button onClick={resetForm} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors">✕</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Descrição *</label>
                  <input
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                    className="input w-full"
                    placeholder="Ex: Resolver exercícios de cálculo"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Data</label>
                    <input
                      type="date"
                      value={formData.planned_date}
                      onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Assunto</label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Nenhum</option>
                      {subjects?.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Tempo (min)</label>
                    <input
                      type="number"
                      value={formData.estimated_minutes}
                      onChange={(e) => setFormData({ ...formData, estimated_minutes: e.target.value })}
                      className="input w-full"
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Prioridade</label>
                    <div className="flex gap-1 bg-surface-container-highest rounded-lg border border-outline-variant/10 p-1">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={clsx(
                            'flex-1 py-2 text-[10px] font-label uppercase tracking-wider transition-all rounded-md',
                            formData.priority === p ? 'bg-surface-container-high text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'
                          )}
                        >
                          {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 bg-surface-container-highest text-on-surface-variant text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 flow-gradient text-on-primary text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'today' && (
          <div className="space-y-2">
            {plans?.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <p className="text-outline">Nenhuma tarefa para hoje. Aproveite seu tempo livre!</p>
              </div>
            ) : (
              plans?.map((plan) => (
                <div
                  key={plan.id}
                  className={clsx(
                    'surface-card p-4 flex items-center gap-4 group',
                    plan.status === 'done' ? 'opacity-60' : ''
                  )}
                >
                  <button
                    onClick={() => updatePlan.mutate({ id: plan.id, updates: { status: plan.status === 'done' ? 'pending' : 'done' } })}
                    className={clsx(
                      'w-5 h-5 rounded border flex items-center justify-center transition-all',
                      plan.status === 'done' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:border-primary'
                    )}
                  >
                    {plan.status === 'done' && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={clsx('font-medium', plan.status === 'done' ? 'line-through text-outline' : '')}>
                      {plan.task}
                    </span>
                    {plan.subject_id && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjects?.find(s => s.id === plan.subject_id)?.color }} />
                        <span className="text-[10px] font-label text-outline uppercase">
                          {subjects?.find((s) => s.id === plan.subject_id)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={clsx(
                    'text-[10px] font-label uppercase px-2 py-1 rounded-md',
                    plan.priority === 'high' ? 'bg-error/10 text-error' : plan.priority === 'medium' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-outline'
                  )}>
                    {plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(plan)} className="text-[10px] font-label text-outline hover:text-primary transition-colors">Editar</button>
                    <button onClick={() => handleDelete(plan.id)} className="text-[10px] font-label text-outline hover:text-error transition-colors">Excluir</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayPlans = getPlansForDate(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={clsx(
                    'surface-card p-4 rounded-xl',
                    isToday ? 'border-primary/20' : ''
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className={clsx('text-[10px] font-label uppercase tracking-wider', isToday ? 'text-primary' : 'text-outline')}>
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={clsx('text-xl font-headline font-bold', isToday ? 'text-primary' : 'text-on-surface')}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    {isToday && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>

                  <div className="space-y-2">
                    {dayPlans.slice(0, 4).map((plan) => (
                      <div key={plan.id} className="flex items-center gap-2">
                        <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', plan.status === 'done' ? 'bg-secondary' : 'bg-primary')} />
                        <span className={clsx('text-[10px] font-label truncate', plan.status === 'done' ? 'text-outline line-through' : 'text-on-surface-variant')}>
                          {plan.task}
                        </span>
                      </div>
                    ))}
                    {dayPlans.length > 4 && (
                      <div className="text-[10px] font-label text-outline pt-1">+ {dayPlans.length - 4} mais</div>
                    )}
                    {dayPlans.length === 0 && (
                      <div className="text-[10px] text-outline/50 italic">Livre</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}