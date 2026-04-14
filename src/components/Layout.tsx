import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import clsx from 'clsx'

const navItems = [
  { path: '/', label: 'Painel', icon: 'dashboard' },
  { path: '/timer', label: 'Sessões', icon: 'timer' },
  { path: '/subjects', label: 'Assuntos', icon: 'menu_book' },
  { path: '/plans', label: 'Planejamento', icon: 'calendar_today' },
  { path: '/reviews', label: 'Revisões', icon: 'rate_review' },
  { path: '/goals', label: 'Desempenho', icon: 'insights' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-surface-dim flex">
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-lowest py-8 px-4 font-headline font-medium text-sm">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-on-surface">StudyFlow</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline mt-1">Santuário Digital</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:translate-x-1 rounded-lg',
                location.pathname === item.path
                  ? 'bg-surface-container-low text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low/50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low/50 rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Configurações</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low/50 rounded-lg transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
            <span>Ajuda</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-50 bg-surface-dim border-b border-outline-variant/10">
          <div className="flex justify-between items-center px-8 py-4 max-w-[1600px] mx-auto">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="text-on-surface-variant hover:text-on-surface transition-colors">Painel</Link>
              <Link to="/subjects" className="text-on-surface-variant hover:text-on-surface transition-colors">Assuntos</Link>
              <Link to="/plans" className="text-on-surface-variant hover:text-on-surface transition-colors">Planejamento</Link>
              <Link to="/timer" className="text-on-surface-variant hover:text-on-surface transition-colors">Sessões</Link>
              <Link to="/reviews" className="text-on-surface-variant hover:text-on-surface transition-colors">Revisões</Link>
              <Link to="/goals" className="text-on-surface-variant hover:text-on-surface transition-colors">Desempenho</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 hover:bg-surface-container-high rounded-md transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-md transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </button>
              <button className="p-2 hover:bg-surface-container-high rounded-md transition-all">
                <span className="material-symbols-outlined text-on-surface-variant">settings</span>
              </button>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-outline-variant/20 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
                  {user?.name?.charAt(0) || '?'}
                </div>
              )}
              <button onClick={logout} className="text-xs font-medium text-outline hover:text-error transition-colors">
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="pt-24 px-8 pb-12 max-w-[1600px] mx-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}