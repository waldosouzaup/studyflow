import { useMemo } from 'react'
import { useAuthStore } from '../store/auth'
import { useSessions, useSessionsByDateRange } from '../hooks/useSessions'
import { usePlans, useUpdatePlan } from '../hooks/usePlans'
import { useReviews } from '../hooks/useReviews'
import { format, subDays, subWeeks, startOfWeek, eachDayOfInterval } from 'date-fns'
import { PageLoading } from '../components/Loading'
import StudyHeatmap from '../components/StudyHeatmap'
import clsx from 'clsx'

import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

  const { data: sessions, isLoading } = useSessions(todayStr, todayStr)
  const { data: weekSessions } = useSessions(weekAgo, todayStr)
  const { data: plans } = usePlans(todayStr)
  const { data: pendingReviews } = useReviews('pending')
  const updatePlan = useUpdatePlan()

  // Heatmap data: last 12 months
  const heatmapFrom = format(subWeeks(startOfWeek(new Date(), { weekStartsOn: 0 }), 51), 'yyyy-MM-dd')
  const { data: yearSessions } = useSessionsByDateRange(heatmapFrom, todayStr)

  if (isLoading) return <PageLoading />

  const todayMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const weekMinutes = weekSessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const todayPlansDone = plans?.filter((p) => p.status === 'done').length || 0

  // ── Streak calculation ──
  const streak = useMemo(() => {
    if (!yearSessions || yearSessions.length === 0) return 0
    const datesWithStudy = new Set<string>()
    yearSessions.forEach((s) => {
      if (s.duration_minutes > 0) datesWithStudy.add(s.date.split('T')[0])
    })

    let count = 0
    let checkDate = new Date()

    // If no study today, start checking from yesterday
    if (!datesWithStudy.has(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1)
    }

    while (datesWithStudy.has(format(checkDate, 'yyyy-MM-dd'))) {
      count++
      checkDate = subDays(checkDate, 1)
    }
    return count
  }, [yearSessions])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-label uppercase tracking-[0.15em] text-primary mb-2 block">Painel</span>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
            {getGreeting()}, {user?.name?.split(' ')[0]}.
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {weekSessions?.length
              ? `${weekSessions.length} sessões registradas nos últimos 7 dias.`
              : 'Comece uma sessão para ver seu progresso aqui.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button onClick={() => navigate('/timer')} className="flow-gradient text-on-primary font-headline font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">play_arrow</span>
              Iniciar Sessão
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {/* Streak Card */}
        <div className="surface-card p-6 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none">🔥</div>
          <span className="text-[11px] font-label uppercase tracking-wider text-outline">Sequência</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-headline font-bold text-on-surface">{streak}</span>
            <span className="text-sm text-outline">{streak === 1 ? 'dia' : 'dias'}</span>
          </div>
          {streak >= 7 && (
            <span className="inline-block mt-2 text-[9px] font-label uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary/10 text-secondary">
              🔥 Em chamas!
            </span>
          )}
        </div>

        <div className="surface-card p-6">
          <span className="text-[11px] font-label uppercase tracking-wider text-outline">Horas Hoje</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-headline font-bold">{Math.floor(todayMinutes / 60)}.{Math.floor((todayMinutes % 60) / 6)}</span>
            <span className="text-sm text-outline">/ 6.0</span>
          </div>
        </div>
        <div className="surface-card p-6">
          <span className="text-[11px] font-label uppercase tracking-wider text-outline">Meta Diária</span>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-secondary font-bold">{plans?.length ? Math.round((todayPlansDone / plans.length) * 100) : 0}%</span>
              <span className="text-outline">Meta: {plans?.length || 0} tarefas</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary-fixed-dim" style={{ width: `${plans?.length ? (todayPlansDone / plans.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="surface-card p-6">
          <span className="text-[11px] font-label uppercase tracking-wider text-outline">Total Semanal</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-headline font-bold">{Math.floor(weekMinutes / 60)}h</span>
            <span className="text-sm text-outline">{(weekMinutes % 60)}m</span>
          </div>
        </div>
        <div className="surface-card p-6">
          <span className="text-[11px] font-label uppercase tracking-wider text-outline">Revisões Pendentes</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-headline font-bold text-tertiary">{pendingReviews?.length || 0}</span>
            <span className="text-sm text-outline">Tópicos</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <StudyHeatmap sessions={yearSessions} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2 surface-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-headline font-bold">Plano de Hoje</h3>
            <span className="text-xs font-label text-outline">{format(new Date(), 'd MMMM, yyyy').toUpperCase()}</span>
          </div>
          <div className="space-y-4">
            {plans?.slice(0, 4).map((plan) => (
              <div key={plan.id} className="flex items-start gap-4 p-4 rounded-xl group hover:bg-surface-container-high transition-colors">
                <div className="mt-1">
                  <button
                    onClick={() => updatePlan.mutate({ id: plan.id, updates: { status: plan.status === 'done' ? 'pending' : 'done' } })}
                    className="w-5 h-5 rounded border border-outline-variant bg-transparent text-primary focus:ring-primary/20 flex items-center justify-center"
                  >
                    {plan.status === 'done' && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className={clsx('font-medium', plan.status === 'done' ? 'line-through decoration-outline-variant/50 opacity-60' : '')}>{plan.task}</p>
                    <span className={clsx(
                      'text-[10px] font-label uppercase px-2 py-0.5 rounded',
                      plan.priority === 'high' ? 'bg-error/10 text-error' : plan.priority === 'medium' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-outline'
                    )}>
                      {plan.priority === 'high' ? 'Alta' : plan.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  {plan.subject_id && (
                    <p className="text-xs text-outline mt-1">Assunto vinculado</p>
                  )}
                </div>
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="text-center py-8 text-outline">Nenhuma tarefa para hoje</div>
            )}
          </div>
          <button onClick={() => navigate('/plans')} className="w-full mt-6 py-3 text-sm text-primary font-medium hover:bg-primary/5 rounded-xl transition-colors border border-dashed border-outline-variant/30">
            + Adicionar Tarefa
          </button>
        </section>

        <section className="lg:col-span-3 space-y-6">
          <section className="surface-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-headline font-bold">Progresso Semanal</h3>
              <div className="flex items-center gap-4 text-xs font-label">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-outline">Horas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-outline">Meta</span>
                </div>
              </div>
            </div>
            <div className="h-40 flex items-end justify-between px-2 gap-4">
              {eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day, i) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const dMinutes = weekSessions?.filter((s) => s.date.split('T')[0] === dayStr).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
                const maxMinutes = 240
                const heightPct = Math.min((dMinutes / maxMinutes) * 100, 100)
                const isToday = i === 6
                
                return (
                  <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                    <div className="w-full bg-primary/20 rounded-t-lg relative group h-full min-h-[20px]">
                      <div className={clsx('absolute bottom-0 w-full rounded-t-lg', dMinutes > 0 ? 'bg-primary' : 'bg-surface-container-highest')} style={{ height: `${heightPct}%` }}></div>
                      {dMinutes > 0 && (
                        <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-mono bg-surface-container-highest px-2 py-1 rounded">{Math.floor(dMinutes / 60)}h</span>
                        </div>
                      )}
                    </div>
                    <span className={clsx('text-[10px] font-label text-outline uppercase', isToday ? 'text-primary font-bold' : '')}>
                      {format(day, 'EEE')}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="surface-card p-8">
            <h3 className="text-xl font-headline font-bold mb-6">Sessões Recentes</h3>
            <div className="space-y-1">
              {sessions?.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{session.topic || 'Sessão de Foco'}</h4>
                      <p className="text-xs text-outline">
                        {session.started_at ? format(new Date(session.started_at), "d MMM, HH:mm") : ''} • {session.session_type || 'Trabalho Profundo'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{Math.floor((session.duration_minutes || 0) / 60)}h {(session.duration_minutes || 0) % 60}m</p>
                  </div>
                </div>
              ))}
              {(!sessions || sessions.length === 0) && (
                <div className="text-center py-6 text-outline text-sm">Nenhuma sessão recente</div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}