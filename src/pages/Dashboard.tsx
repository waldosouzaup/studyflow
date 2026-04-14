import { useAuthStore } from '../store/auth'
import { useSessions } from '../hooks/useSessions'
import { usePlans } from '../hooks/usePlans'
import { useReviews } from '../hooks/useReviews'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { PageLoading } from '../components/Loading'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

  const { data: sessions, isLoading } = useSessions(todayStr, todayStr)
  const { data: weekSessions } = useSessions(weekAgo, todayStr)
  const { data: plans } = usePlans(todayStr)
  const { data: pendingReviews } = useReviews('pending')

  if (isLoading) return <PageLoading />

  const todayMinutes = sessions?.reduce((sum, s) => sum + s.durationMinutes, 0) || 0
  const weekMinutes = weekSessions?.reduce((sum, s) => sum + s.durationMinutes, 0) || 0
  const todayPlansDone = plans?.filter((p) => p.status === 'done').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Bem-vindo, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hoje</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Esta Semana</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {Math.floor(weekMinutes / 60)}h {weekMinutes % 60}m
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tarefas Hoje</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {todayPlansDone}/{plans?.length || 0}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Revisões</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {pendingReviews?.length || 0} pending
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Atividade da Semana</h2>
        <div className="flex gap-1">
          {eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayMinutes = weekSessions?.filter((s) => s.date.split('T')[0] === dayStr).reduce((sum, s) => sum + s.durationMinutes, 0) || 0
            const intensity = dayMinutes === 0 ? 0 : dayMinutes < 30 ? 1 : dayMinutes < 60 ? 2 : dayMinutes < 120 ? 3 : 4
            const colors = ['bg-slate-200 dark:bg-slate-700', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600']
            return (
              <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-8 rounded ${colors[intensity]}`} />
                <span className="text-xs text-slate-500">{format(day, 'EEEEE')}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}