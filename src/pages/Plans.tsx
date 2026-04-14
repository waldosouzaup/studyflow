import { useState } from 'react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans'
import { useSubjects } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import type { Plan } from '../types/database'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Plans() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const [view, setView] = useState<'today' | 'week'>('today')
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    task: '',
    subjectId: '',
    plannedDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  })

  const today = new Date().toISOString().split('T')[0]
  const { data: plans, isLoading, error } = usePlans(view === 'today' ? today : undefined)
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
            subjectId: formData.subjectId || null,
            plannedDate: formData.plannedDate,
            estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : null,
            priority: formData.priority,
          },
        })
      } else {
        await createPlan.mutateAsync({
          userId,
          subjectId: formData.subjectId || null,
          plannedDate: formData.plannedDate,
          task: formData.task,
          estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : null,
          priority: formData.priority,
          status: 'pending',
          isOverdue: false,
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
      subjectId: plan.subjectId || '',
      plannedDate: plan.plannedDate.split('T')[0],
      estimatedMinutes: plan.estimatedMinutes?.toString() || '',
      priority: plan.priority,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta tarefa?')) {
      await deletePlan.mutateAsync(id)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingPlan(null)
    setFormData({
      task: '',
      subjectId: '',
      plannedDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: '',
      priority: 'medium',
    })
  }

  const getPlansForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return plans?.filter((p) => p.plannedDate.split('T')[0] === dateStr) || []
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Erro ao carregar planos" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Planejamento</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('today')}
            className={`px-4 py-2 rounded-lg ${
              view === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Semana
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6"
      >
        + Nova Tarefa
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingPlan ? 'Editar' : 'Nova'} Tarefa
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tarefa *</label>
                <input
                  type="text"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="O que você precisa fazer?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={formData.plannedDate}
                  onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assunto</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Sem assunto</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Estimativa (min)</label>
                  <input
                    type="number"
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <p className="text-gray-500">Nenhuma tarefa para hoje!</p>
          ) : (
            plans?.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 bg-white rounded-lg shadow border border-gray-100 ${
                  plan.status === 'done' ? 'opacity-60' : plan.isOverdue ? 'border-red-300' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={plan.status === 'done'}
                      onChange={(e) =>
                        updatePlan.mutate({
                          id: plan.id,
                          updates: { status: e.target.checked ? 'done' : 'pending' },
                        })
                      }
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <span
                        className={plan.status === 'done' ? 'line-through text-gray-400' : ''}
                      >
                        {plan.task}
                      </span>
                      {plan.subjectId && (
                        <span className="ml-2 text-sm text-gray-400">
                          ({subjects?.find((s) => s.id === plan.subjectId)?.name})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        plan.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : plan.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayPlans = getPlansForDate(day)
            const isToday = isSameDay(day, new Date())
            return (
              <div
                key={day.toISOString()}
                className={`p-3 rounded-lg min-h-[150px] ${
                  isToday ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, 'EEE', { locale: ptBR })}
                </div>
                <div className="text-lg font-bold mb-2">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayPlans.slice(0, 3).map((plan) => (
                    <div
                      key={plan.id}
                      className={`text-xs p-1 rounded ${
                        plan.status === 'done'
                          ? 'bg-green-100 text-green-700'
                          : plan.isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-white'
                      }`}
                    >
                      {plan.task.substring(0, 20)}
                    </div>
                  ))}
                  {dayPlans.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayPlans.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}