import { useState } from 'react'
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects'
import { useAuthStore } from '../store/auth'
import { PageLoading, ErrorMessage } from '../components/Loading'
import clsx from 'clsx'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']

export default function Subjects() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const { data: subjects, isLoading, error } = useSubjects()
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()
  const deleteSubject = useDeleteSubject()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', color: COLORS[0], description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    try {
      if (editId) {
        await updateSubject.mutateAsync({ id: editId, updates: { name: formData.name, color: formData.color, description: formData.description || null } })
      } else {
        await createSubject.mutateAsync({ user_id: userId, name: formData.name, color: formData.color, description: formData.description || null })
      }
      resetForm()
    } catch { console.error('Erro ao salvar assunto') }
  }

  const handleEdit = (s: any) => {
    setEditId(s.id)
    setFormData({ name: s.name, color: s.color, description: s.description || '' })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este assunto?')) return
    try { await deleteSubject.mutateAsync(id) } catch { console.error('Erro ao remover') }
  }

  const resetForm = () => {
    setShowForm(false); setEditId(null); setFormData({ name: '', color: COLORS[0], description: '' })
  }

  if (isLoading) return <PageLoading />
  if (error) return <ErrorMessage message="Falha ao carregar assuntos." />

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-muted)]">Biblioteca</span>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Assuntos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Assunto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-label uppercase tracking-[0.12em] text-accent">{editId ? 'Editar' : 'Novo'}</span>
                  <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Assunto</h2>
                </div>
                <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-card text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">✕</button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Nome *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" placeholder="Ex: Linux, AWS, Redes" required />
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                      className={clsx('w-7 h-7 rounded-sharp transition-all', formData.color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-raised)] scale-110' : 'hover:scale-105')}
                      style={{ backgroundColor: c, ...(formData.color === c ? { ringColor: c } : {}) }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input w-full resize-none" rows={2} placeholder="Opcional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 btn-ghost py-2.5 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 btn-accent py-2.5 text-sm font-semibold">{editId ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects?.map((s) => (
          <div key={s.id} className="card-interactive p-4 group relative">
            <div className="flex items-start gap-3">
              <div className="w-2 h-10 rounded-sharp shrink-0" style={{ backgroundColor: s.color }} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-accent transition-colors truncate">{s.name}</h3>
                {s.description && <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">{s.description}</p>}
              </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(s)} className="p-1.5 rounded-card hover:bg-[var(--bg-subtle)] transition-colors">
                <span className="material-symbols-outlined text-[14px] text-[var(--text-muted)]">edit</span>
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-card hover:bg-[var(--danger-muted)] transition-colors">
                <span className="material-symbols-outlined text-[14px] text-danger">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!subjects || subjects.length === 0) && (
        <div className="card p-10 text-center text-sm text-[var(--text-muted)]">
          Nenhum assunto cadastrado. Crie o primeiro!
        </div>
      )}
    </div>
  )
}