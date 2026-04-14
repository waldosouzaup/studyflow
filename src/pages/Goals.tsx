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
    return { start: '', end: '' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const period = getPeriod(formData.type)
    try {
      await createGoal.mutateAsync({
        userId,
        subjectId: formData.subjectId || null,
        type: formData.type,
        targetMinutes: formData.targetMinutes,
        periodStart: period.start,
        periodEnd: period.end,
        isActive: true,
      })
      setShowForm(false)
      setFormData({ subjectId: '', type: 'daily', targetMinutes: 60 })
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Erro ao carregar metas" />

  const dailyGoals = goals?.filter((g) => g.type === 'daily') || []
  const weeklyGoals = goals?.filter((g) => g.type === 'weekly') || []
  const monthlyGoals = goals?.filter((g) => g.type === 'monthly') || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Metas</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Meta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assunto</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Global (todos)</option>
                  {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta (minutos)</label>
                <input
                  type="number"
                  value={formData.targetMinutes}
                  onChange={(e) => setFormData({ ...formData, targetMinutes: parseInt(e.target.value) })}
                  className="w-full p-3 border rounded-lg"
                  min={1}
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

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-medium mb-3">Diárias</h3>
          {dailyGoals.length === 0 ? <p className="text-gray-500">Nenhuma meta diária</p> : (
            <div className="space-y-2">
              {dailyGoals.map((goal) => <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subjectId)} updateGoal={updateGoal} />)}
            </div>
          )}
        </section>
        <section>
          <h3 className="text-lg font-medium mb-3">Semanais</h3>
          {weeklyGoals.length === 0 ? <p className="text-gray-500">Nenhuma meta semanal</p> : (
            <div className="space-y-2">
              {weeklyGoals.map((goal) => <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subjectId)} updateGoal={updateGoal} />)}
            </div>
          )}
        </section>
        <section>
          <h3 className="text-lg font-medium mb-3">Mensais</h3>
          {monthlyGoals.length === 0 ? <p className="text-gray-500">Nenhuma meta mensal</p> : (
            <div className="space-y-2">
              {monthlyGoals.map((goal) => <GoalCard key={goal.id} goal={goal} subject={subjects?.find((s) => s.id === goal.subjectId)} updateGoal={updateGoal} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function GoalCard({ goal, subject, updateGoal }: { goal: Goal; subject?: { name: string; color: string }; updateGoal: any }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {subject && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />}
          <span className="font-medium">{subject?.name || 'Global'}</span>
          <span className="text-gray-500 text-sm">- {goal.type === 'daily' ? 'hoje' : goal.type === 'weekly' ? 'esta semana' : 'este mês'}</span>
        </div>
        <button
          onClick={() => updateGoal.mutate({ id: goal.id, updates: { isActive: !goal.isActive } })}
          className={`px-2 py-1 rounded text-sm ${goal.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}
        >
          {goal.isActive ? 'Ativa' : 'Inativa'}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
        </div>
        <span className="text-sm text-gray-500">0/{goal.targetMinutes}min</span>
      </div>
    </div>
  )
}