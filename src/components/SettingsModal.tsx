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
      <div className="bg-surface-container-low w-full max-w-lg rounded-xl border border-outline-variant/10 animate-scaleIn">
        <div className="p-8 border-b border-outline-variant/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-label uppercase tracking-[0.15em] text-primary mb-1">Sistema</p>
              <h2 className="text-2xl font-headline font-bold text-on-surface">Configurações</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-high transition-colors">✕</button>
          </div>
        </div>

        <div className="flex border-b border-outline-variant/10">
          {(['appearance', 'account'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex-1 py-3 text-[10px] font-label uppercase tracking-[0.15em] transition-colors',
                activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-on-surface'
              )}
            >
              {tab === 'appearance' ? 'Aparência' : 'Conta'}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-6">
          {activeTab === 'appearance' && (
            <>
              <div className="space-y-3">
                <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline">Tema</label>
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
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        theme === opt.value
                          ? 'border-primary bg-primary/10 text-on-surface'
                          : 'border-outline-variant/10 bg-surface-container-highest text-outline hover:text-on-surface hover:border-outline-variant/30'
                      )}
                    >
                      <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                      <span className="text-[10px] font-label uppercase tracking-wider">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline">info</span>
                  <p className="text-xs text-on-surface-variant">
                    O tema "{theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Sistema'}" está ativo. As mudanças são aplicadas instantaneamente.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full border border-outline-variant/20 object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary text-2xl font-bold">
                      {user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface">{user?.name || 'Usuário'}</h3>
                    <p className="text-xs text-outline">{user?.email}</p>
                  </div>
                </div>

                <div className="surface-card p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-label uppercase tracking-[0.15em] text-outline">Membro desde</span>
                    <span className="text-xs text-on-surface-variant font-mono">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </div>
                  <div className="h-px bg-outline-variant/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-label uppercase tracking-[0.15em] text-outline">ID</span>
                    <span className="text-xs text-on-surface-variant font-mono">{user?.id?.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-surface-container-highest text-on-surface-variant text-sm font-medium rounded-lg hover:bg-surface-container-high transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
