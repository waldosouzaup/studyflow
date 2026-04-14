import { useState } from 'react'
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects'
import { PageLoading, ErrorMessage } from '../components/Loading'
import type { Subject } from '../types/database'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#08410c',
]

export default function Subjects() {
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
      alert('Nome deve ter entre 3 e 60 caracteres')
      return
    }

    const data = {
      userId: '',
      name: formData.name,
      color: formData.color,
      weeklyGoalHours: formData.weeklyGoalHours ? parseFloat(formData.weeklyGoalHours) : null,
      monthlyGoalHours: formData.monthlyGoalHours ? parseFloat(formData.monthlyGoalHours) : null,
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({ id: editingSubject.id, updates: data })
      } else {
        await createSubject.mutateAsync(data as any)
      }
      setShowForm(false)
      setEditingSubject(null)
      setFormData({ name: '', color: COLORS[0], weeklyGoalHours: '', monthlyGoalHours: '' })
    } catch (err) {
      alert('Erro ao salvar assunto')
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      color: subject.color,
      weeklyGoalHours: subject.weeklyGoalHours?.toString() || '',
      monthlyGoalHours: subject.monthlyGoalHours?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este assunto?')) {
      await deleteSubject.mutateAsync(id)
    }
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Erro ao carregar assuntos" />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assuntos</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingSubject(null)
            setFormData({ name: '', color: COLORS[0], weeklyGoalHours: '', monthlyGoalHours: '' })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Novo Assunto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingSubject ? 'Editar' : 'Novo'} Assunto
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Ex: Matemática, Física..."
                  maxLength={60}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full ${
                        formData.color === c ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Semanal (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.weeklyGoalHours}
                    onChange={(e) => setFormData({ ...formData, weeklyGoalHours: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Mensal (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.monthlyGoalHours}
                    onChange={(e) => setFormData({ ...formData, monthlyGoalHours: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

      {subjects?.length === 0 ? (
        <p className="text-gray-500">Nenhum assunto ainda. Crie seu primeiro!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects?.map((subject) => (
            <div
              key={subject.id}
              className="p-4 bg-white rounded-lg shadow border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h3 className="font-medium">{subject.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subject)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              {(subject.weeklyGoalHours || subject.monthlyGoalHours) && (
                <div className="mt-2 text-sm text-gray-500">
                  {subject.weeklyGoalHours && (
                    <span className="mr-3">Semanal: {subject.weeklyGoalHours}h</span>
                  )}
                  {subject.monthlyGoalHours && (
                    <span>Mensal: {subject.monthlyGoalHours}h</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}