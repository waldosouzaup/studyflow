import { useMemo } from 'react'
import { useAuthStore } from '../store/auth'
import { useSessions, useSessionsByDateRange } from '../hooks/useSessions'
import { usePlans, useUpdatePlan } from '../hooks/usePlans'
import { useReviews } from '../hooks/useReviews'
import { format, subDays, subWeeks, startOfWeek } from 'date-fns'
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

  // Streak calculation
  const streak = useMemo(() => {
    if (!yearSessions || yearSessions.length === 0) return 0
    const datesWithStudy = new Set<string>()
    yearSessions.forEach((s) => {
      if (s.duration_minutes > 0) datesWithStudy.add(s.date.split('T')[0])
    })
    let count = 0
    let checkDate = new Date()
    if (!datesWithStudy.has(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1)
    }
    while (datesWithStudy.has(format(checkDate, 'yyyy-MM-dd'))) {
      count++
      checkDate = subDays(checkDate, 1)
    }
    return count
  }, [yearSessions])

  if (isLoading) return <PageLoading />

  const todayMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const weekMinutes = weekSessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0
  const todayPlansDone = plans?.filter((p) => p.status === 'done').length || 0
  const totalPlans = plans?.length || 0
  const progressPct = totalPlans ? Math.round((todayPlansDone / totalPlans) * 100) : 0
  const todayHours = Math.floor(todayMinutes / 60)
  const todayMins = todayMinutes % 60
  const weekHours = Math.floor(weekMinutes / 60)
  const weekMins = weekMinutes % 60

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Next pending plan for "Próxima sessão" card
  const nextTask = plans?.find(p => p.status === 'pending')

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
          {getGreeting()}, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {weekSessions?.length
            ? `${weekSessions.length} sessões nos últimos 7 dias`
            : 'Comece sua primeira sessão de estudo.'}
        </p>
      </div>

      {/* ─── Action Card (Próxima Sessão) ─── */}
      <div
        onClick={() => navigate('/timer')}
        className="card-interactive p-5 lg:p-6 relative overflow-hidden cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="badge badge-accent">Próxima sessão</span>
            <span className="material-symbols-outlined text-accent text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
          {nextTask ? (
            <>
              <h2 className="text-lg lg:text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                {nextTask.task}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {nextTask.estimated_minutes ? `${nextTask.estimated_minutes} min` : 'Sem tempo estimado'}
                {nextTask.priority === 'high' && ' · Prioridade alta'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg lg:text-xl font-display font-bold text-[var(--text-primary)] mb-1">
                Iniciar sessão livre
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Escolha um assunto e comece a estudar
              </p>
            </>
          )}
          <button
            className="mt-4 btn-accent px-5 py-2.5 text-sm font-semibold flex items-center gap-2 group-hover:shadow-accent transition-shadow"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            COMEÇAR AGORA
          </button>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="card p-4 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 text-4xl opacity-[0.08] select-none">🔥</div>
          <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Sequência</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-display font-bold text-[var(--text-primary)]">{streak}</span>
            <span className="text-xs text-[var(--text-muted)]">{streak === 1 ? 'dia' : 'dias'}</span>
          </div>
          {streak >= 7 && (
            <span className="inline-block mt-2 badge badge-gold text-[8px]">🔥 Em chamas</span>
          )}
        </div>

        {/* Horas Hoje */}
        <div className="card p-4">
          <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Hoje</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-display font-bold text-[var(--text-primary)]">
              {todayHours > 0 ? `${todayHours}h` : ''}{todayMins > 0 ? `${todayMins}m` : todayHours === 0 ? '0m' : ''}
            </span>
          </div>
        </div>

        {/* Meta Diária */}
        <div className="card p-4">
          <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Progresso</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-display font-bold text-accent">{progressPct}%</span>
            <span className="text-xs text-[var(--text-muted)]">{todayPlansDone}/{totalPlans}</span>
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Total Semanal */}
        <div className="card p-4">
          <span className="text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">Semana</span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-display font-bold text-[var(--text-primary)]">
              {weekHours}h{weekMins > 0 ? ` ${weekMins}m` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Heatmap ─── */}
      <StudyHeatmap sessions={yearSessions} />

      {/* ─── Two Column: Plans + Sessions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Plan */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-bold text-[var(--text-primary)]">Plano de Hoje</h3>
            <span className="text-[10px] font-label text-[var(--text-muted)] uppercase tracking-wider">
              {todayPlansDone}/{totalPlans} feitas
            </span>
          </div>
          <div className="space-y-1.5">
            {plans?.slice(0, 5).map((plan) => (
              <div
                key={plan.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-sharp transition-colors hover:bg-[var(--bg-subtle)]',
                  plan.status === 'done' && 'opacity-50'
                )}
              >
                <button
                  onClick={() => updatePlan.mutate({ id: plan.id, updates: { status: plan.status === 'done' ? 'pending' : 'done' } })}
                  className={clsx(
                    'w-[18px] h-[18px] rounded-sharp border flex items-center justify-center shrink-0 transition-all',
                    plan.status === 'done'
                      ? 'bg-accent border-accent'
                      : 'border-[var(--border)] hover:border-accent'
                  )}
                >
                  {plan.status === 'done' && <span className="material-symbols-outlined text-[12px] text-[var(--text-inverted)]">check</span>}
                </button>
                <span className={clsx(
                  'text-sm flex-1 min-w-0 truncate',
                  plan.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                )}>
                  {plan.task}
                </span>
                {plan.priority === 'high' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" title="Alta prioridade" />
                )}
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="text-center py-6 text-[var(--text-muted)] text-sm">
                Nenhuma tarefa para hoje
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="w-full mt-4 py-2.5 text-xs font-semibold text-accent hover:bg-[var(--accent-muted)] rounded-card transition-colors border border-dashed border-[var(--border)]"
          >
            + Adicionar Tarefa
          </button>
        </section>

        {/* Recent + Reviews */}
        <div className="space-y-4">
          {/* Recent Sessions */}
          <section className="card p-5">
            <h3 className="text-base font-display font-bold text-[var(--text-primary)] mb-4">Sessões Recentes</h3>
            <div className="space-y-1">
              {sessions?.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-sharp hover:bg-[var(--bg-subtle)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-sharp bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-accent text-[16px]">psychology</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{session.topic || 'Sessão de Foco'}</h4>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {session.started_at ? format(new Date(session.started_at), "HH:mm") : ''} · {session.session_type === 'pomodoro' ? 'Pomodoro' : 'Contínua'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold text-[var(--text-primary)] shrink-0 ml-2">
                    {Math.floor((session.duration_minutes || 0) / 60)}h {(session.duration_minutes || 0) % 60}m
                  </span>
                </div>
              ))}
              {(!sessions || sessions.length === 0) && (
                <div className="text-center py-4 text-[var(--text-muted)] text-sm">Nenhuma sessão hoje</div>
              )}
            </div>
          </section>

          {/* Pending Reviews */}
          {pendingReviews && pendingReviews.length > 0 && (
            <section className="card p-5 border-l-2 border-l-gold">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-display font-bold text-[var(--text-primary)]">Revisões Pendentes</h3>
                <span className="badge badge-gold">{pendingReviews.length}</span>
              </div>
              <div className="space-y-1.5">
                {pendingReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-center gap-3 p-2 rounded-sharp">
                    <span className="material-symbols-outlined text-gold text-[16px]">replay</span>
                    <span className="text-sm text-[var(--text-secondary)] truncate flex-1">{review.topic}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/reviews')}
                className="mt-3 text-xs font-semibold text-gold hover:underline"
              >
                Ver todas →
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}