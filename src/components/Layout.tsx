import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import { supabase } from '../lib/supabase'
import SettingsModal from './SettingsModal'
import clsx from 'clsx'

const navItems = [
  { path: '/', label: 'Home', icon: 'space_dashboard', mobileLabel: 'Home' },
  { path: '/timer', label: 'Sessão', icon: 'timer', mobileLabel: 'Sessão' },
  { path: '/subjects', label: 'Assuntos', icon: 'menu_book', mobileLabel: 'Assuntos' },
  { path: '/plans', label: 'Plano', icon: 'event_note', mobileLabel: 'Plano' },
  { path: '/reviews', label: 'Revisões', icon: 'replay', mobileLabel: 'Revisões' },
  { path: '/goals', label: 'Metas', icon: 'trending_up', mobileLabel: 'Metas' },
  { path: '/manual', label: 'Manual', icon: 'help', mobileLabel: 'Ajuda' },
]

const mobileNavItems = navItems.slice(0, 4)
const mobileMoreItems = navItems.slice(4)

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Erro ao deslogar:', e)
    }
    logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isMoreActive = mobileMoreItems.some(item => isActive(item.path))

  return (
    <div className="min-h-screen bg-base">
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex flex-col h-screen w-[240px] fixed left-0 top-0 bg-raised border-r border-[var(--border)] z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-[var(--border)]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-card bg-accent flex items-center justify-center">
              <span className="text-sm font-display font-bold text-[var(--text-inverted)]">UP</span>
            </div>
            <div>
              <h1 className="text-sm font-display font-bold text-[var(--text-primary)] tracking-tight">UP Estudos</h1>
              <p className="text-[10px] text-[var(--text-muted)] font-label uppercase tracking-[0.12em]">Foco em Resultados</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-all duration-150',
                isActive(item.path)
                  ? 'bg-[var(--accent-muted)] text-accent'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              )}
            >
              <span className={clsx(
                'material-symbols-outlined text-[20px]',
                isActive(item.path) && 'font-variation-settings-fill'
              )} style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-[var(--border)] space-y-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Configurações</span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-card bg-[var(--bg-elevated)]">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--border)]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[var(--text-inverted)] text-xs font-bold">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user?.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-card hover:bg-[var(--bg-subtle)] transition-all" title="Sair">
              <span className="material-symbols-outlined text-[16px] text-[var(--text-muted)]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ Mobile Top Bar ═══ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base/90 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sharp bg-accent flex items-center justify-center">
              <span className="text-[10px] font-display font-bold text-[var(--text-inverted)]">UP</span>
            </div>
            <span className="text-sm font-display font-bold text-[var(--text-primary)]">UP Estudos</span>
          </Link>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-card hover:bg-[var(--bg-subtle)] transition-all">
              <span className="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-card hover:bg-[var(--bg-subtle)] transition-all">
              <span className="material-symbols-outlined text-[20px] text-[var(--text-secondary)]">settings</span>
            </button>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-[var(--border)] ml-1" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[var(--text-inverted)] text-[10px] font-bold ml-1">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ Desktop Top Bar (minimal) ═══ */}
      <header className="hidden lg:flex fixed top-0 right-0 left-[240px] z-30 bg-base/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="flex items-center justify-end w-full px-6 h-12">
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-card hover:bg-[var(--bg-subtle)] transition-all">
              <span className="material-symbols-outlined text-[18px] text-[var(--text-secondary)]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className={clsx(
        'min-h-screen transition-all',
        'pt-14 pb-20 px-4',              // mobile: top bar + bottom nav
        'lg:pt-12 lg:pb-8 lg:px-6 lg:ml-[240px]'  // desktop: minimal top + sidebar
      )}>
        <div className="max-w-[1200px] mx-auto py-4 lg:py-6">
          {children}
        </div>
      </main>

      {/* ═══ Mobile Bottom Navigation ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-raised/95 backdrop-blur-lg border-t border-[var(--border)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg min-w-[56px] transition-all duration-150',
                isActive(item.path)
                  ? 'text-accent'
                  : 'text-[var(--text-muted)] active:text-[var(--text-secondary)]'
              )}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.mobileLabel}</span>
            </Link>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg min-w-[56px] transition-all duration-150 relative',
              isMoreActive
                ? 'text-accent'
                : 'text-[var(--text-muted)] active:text-[var(--text-secondary)]'
            )}
          >
            <span className="material-symbols-outlined text-[22px]">more_horiz</span>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>

        {/* More dropdown */}
        {showMore && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
            <div className="absolute bottom-full right-3 mb-2 bg-raised border border-[var(--border)] rounded-card shadow-lg animate-scaleIn z-50 min-w-[160px]">
              {mobileMoreItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMore(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-all first:rounded-t-card last:rounded-b-card',
                    isActive(item.path)
                      ? 'bg-[var(--accent-muted)] text-accent'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="font-medium">{item.mobileLabel}</span>
                </Link>
              ))}
              <div className="border-t border-[var(--border)]">
                <button
                  onClick={() => { setShowMore(false); handleLogout() }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-danger w-full hover:bg-[var(--danger-muted)] rounded-b-card transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}