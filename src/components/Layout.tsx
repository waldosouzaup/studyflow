import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useThemeStore } from '../store/theme'
import clsx from 'clsx'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/timer', label: 'Timer', icon: '⏱️' },
  { path: '/subjects', label: 'Assuntos', icon: '📚' },
  { path: '/plans', label: 'Planos', icon: '📝' },
  { path: '/reviews', label: 'Revisões', icon: '🔄' },
  { path: '/goals', label: 'Metas', icon: '🎯' },
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudyFlow
              </h1>
              <nav className="hidden md:flex gap-1" aria-label="Navegação principal">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition',
                      location.pathname === item.path
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                    )}
                  >
                    <span className="mr-1" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              {user?.avatarUrl && (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
              )}
              <button
                onClick={logout}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            App criado por:{' '}
            <a 
              href="https://waldoeller.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition"
            >
              Waldo Eller
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}