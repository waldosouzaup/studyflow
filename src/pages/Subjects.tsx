import { useState } from 'react'
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects'
import { PageLoading, ErrorMessage } from '../components/Loading'
import { useAuthStore } from '../store/auth'
import type { Subject } from '../types/database'

const COLORS = [
  '#ADC7FF', '#E9C349', '#FFB695', '#8B90A0', '#4A8EFF',
  '#C0A030', '#E08060', '#353534', '#2A2A2A', '#1C1B1B',
]

export default function Subjects() {
  const user = useAuthStore((s) => s.user)
  const { data: subjects, isLoading, error } = useSubjects()
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()
  const deleteSubject = useDeleteSubject()

  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
    weeklyGoalHours: '',
    monthlyGoalHours: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.length < 3 || formData.name.length > 60) {
      alert('O nome deve ter entre 3 e 60 caracteres.')
      return
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          updates: {
            name: formData.name,
            color: formData.color,
            weekly_goal_hours: formData.weeklyGoalHours ? parseFloat(formData.weeklyGoalHours) : null,
            monthly_goal_hours: formData.monthlyGoalHours ? parseFloat(formData.monthlyGoalHours) : null,
          },
        })
      } else {
        await createSubject.mutateAsync({
          user_id: user?.id || '',
          name: formData.name,
          color: formData.color,
          weekly_goal_hours: formData.weeklyGoalHours ? parseFloat(formData.weeklyGoalHours) : null,
          monthly_goal_hours: formData.monthlyGoalHours ? parseFloat(formData.monthlyGoalHours) : null,
        })
      }
      setShowForm(false)
      setEditingSubject(null)
      setFormData({ name: '', color: COLORS[0], weeklyGoalHours: '', monthlyGoalHours: '' })
    } catch (err) {
      alert('Erro ao salvar assunto.')
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      color: subject.color,
      weeklyGoalHours: subject.weekly_goal_hours?.toString() || '',
      monthlyGoalHours: subject.monthly_goal_hours?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Confirmar exclusão?')) {
      await deleteSubject.mutateAsync(id)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar assuntos." />

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs font-label uppercase tracking-widest text-primary mb-2 block">Curadoria</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Núcleo de Conhecimento</h1>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            <span className="font-medium text-on-surface-variant">Filtrar</span>
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingSubject(null)
              setFormData({ name: '', color: COLORS[0], weeklyGoalHours: '', monthlyGoalHours: '' })
            }}
            className="gold-accent text-on-secondary px-8 py-3 rounded-lg font-bold flex items-center gap-2 active:scale-95 transition-transform shadow-xl shadow-secondary/20"
          >
            <span className="material-symbols-outlined">add</span>
            Novo Assunto
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low w-full max-w-lg rounded-xl border border-outline-variant/10 animate-scaleIn">
            <div className="p-8 border-b border-outline-variant/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-label uppercase tracking-[0.15em] text-primary mb-1">Dados do Assunto</p>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">
                    {editingSubject ? 'Editar' : 'Novo'} Assunto
                  </h2>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors">
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Ex: Matemática Avançada"
                  maxLength={60}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === c ? 'border-on-surface scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Meta Semanal (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.weeklyGoalHours}
                    onChange={(e) => setFormData({ ...formData, weeklyGoalHours: e.target.value })}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Meta Mensal (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.monthlyGoalHours}
                    onChange={(e) => setFormData({ ...formData, monthlyGoalHours: e.target.value })}
                    className="input w-full"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

      {subjects?.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-outline text-3xl">library_add</span>
          </div>
          <p className="font-headline font-bold text-outline">Expanda Seus Horizontes</p>
          <p className="text-outline/60 text-xs mt-1">Adicione um novo assunto para acompanhar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.map((subject) => (
            <div
              key={subject.id}
              className="surface-card p-8 min-h-[280px] flex flex-col justify-between group hover:scale-[1.02] transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>book</span>
                  </div>
                  <span className="badge badge-primary">Ativo</span>
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{subject.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1">ID: {subject.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-label uppercase tracking-widest text-outline">Meta Semanal</span>
                    <p className="text-lg font-headline font-bold text-on-surface">
                      {subject.weekly_goal_hours || '—'} <span className="text-sm font-normal text-outline">h/semana</span>
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full flow-gradient relative" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/10">
                <button onClick={() => handleEdit(subject)} className="text-xs font-medium text-outline hover:text-primary transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(subject.id)} className="text-xs font-medium text-outline hover:text-error transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}