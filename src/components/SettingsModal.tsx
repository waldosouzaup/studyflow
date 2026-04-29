import { useState } from 'react'
import { useThemeStore } from '../store/theme'
import { useAuthStore } from '../store/auth'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
  const { theme, setTheme } = useThemeStore()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'appearance' | 'account'>('appearance')

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="card w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-label uppercase tracking-[0.12em] text-accent">Sistema</span>
              <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Configurações</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-card text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">✕</button>
          </div>
        </div>

        <div className="flex border-b border-[var(--border)]">
          {(['appearance', 'account'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex-1 py-3 text-[10px] font-label uppercase tracking-[0.12em] transition-colors',
                activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {tab === 'appearance' ? 'Aparência' : 'Conta'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'appearance' && (
            <>
              <div className="space-y-3">
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Tema</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'light' as const, icon: 'light_mode', label: 'Claro' },
                    { value: 'dark' as const, icon: 'dark_mode', label: 'Escuro' },
                    { value: 'system' as const, icon: 'desktop_windows', label: 'Sistema' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-card border transition-all',
                        theme === opt.value
                          ? 'border-accent bg-[var(--accent-muted)] text-accent'
                          : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                      <span className="text-[10px] font-label uppercase tracking-wider">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--text-muted)] text-[18px]">info</span>
                  <p className="text-xs text-[var(--text-secondary)]">
                    O tema "{theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}" está ativo.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full border border-[var(--border)] object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-[var(--text-inverted)] text-xl font-bold">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-display font-bold text-[var(--text-primary)]">{user?.name || 'Usuário'}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                </div>
              </div>

              <div className="card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Membro desde</span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">ID</span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{user?.id?.slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full btn-ghost py-2.5 text-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
