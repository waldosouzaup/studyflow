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
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-[var(--text-primary)] tracking-tight">
          {getGreeting()}, <span className="text-accent">{user?.name?.split(' ')[0]}</span>.
        </h1>
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-accent">bolt</span>
          {weekSessions?.length
            ? `${weekSessions.length} sessões nos últimos 7 dias`
            : 'Comece sua primeira sessão de estudo.'}
        </p>
      </div>

      {/* ─── Action Card (Próxima Sessão) ─── */}
      <div
        onClick={() => navigate('/timer')}
        className="card-interactive p-6 lg:p-8 relative overflow-hidden cursor-pointer group border-l-4 border-l-accent min-h-[160px] flex flex-col justify-between bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-base)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:bg-accent/10 transition-colors duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="badge badge-accent bg-[var(--bg-base)] border border-accent/20 px-3 py-1">Próxima sessão</span>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-base)] flex items-center justify-center border border-[var(--border)] group-hover:border-accent/30 group-hover:bg-[var(--accent-muted)] transition-all">
              <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-accent text-[20px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
          {nextTask ? (
            <div className="pr-12">
              <h2 className="text-xl lg:text-2xl font-display font-bold text-[var(--text-primary)] mb-2 group-hover:text-accent transition-colors">
                {nextTask.task}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {nextTask.estimated_minutes ? `${nextTask.estimated_minutes} min` : 'Sem estimativa'}
                </span>
                {nextTask.priority === 'high' && (
                  <span className="flex items-center gap-1 text-danger">
                    <span className="material-symbols-outlined text-[14px]">priority_high</span>
                    Alta prioridade
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="pr-12">
              <h2 className="text-xl lg:text-2xl font-display font-bold text-[var(--text-primary)] mb-2 group-hover:text-accent transition-colors">
                Iniciar sessão livre
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Escolha um assunto e mergulhe nos estudos agora mesmo.
              </p>
            </div>
          )}
          <button
            className="mt-6 btn-accent px-6 py-3 text-sm font-semibold flex items-center gap-2 group-hover:shadow-accent transition-shadow w-fit"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            COMEÇAR AGORA
          </button>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="card p-5 relative overflow-hidden flex flex-col justify-between min-h-[120px] group">
          <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity select-none">🔥</div>
          <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">
            <span className="material-symbols-outlined text-[16px] text-accent">local_fire_department</span>
            Sequência
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">{streak}</span>
              <span className="text-xs text-[var(--text-muted)] font-medium">{streak === 1 ? 'dia' : 'dias'}</span>
            </div>
            {streak >= 7 && (
              <span className="inline-block mt-1 badge badge-gold text-[8px] bg-transparent border border-gold/30 px-1.5 py-0.5">🔥 Em chamas</span>
            )}
          </div>
        </div>

        {/* Horas Hoje */}
        <div className="card p-5 flex flex-col justify-between min-h-[120px] group">
          <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">
            <span className="material-symbols-outlined text-[16px] text-[var(--text-secondary)] group-hover:text-accent transition-colors">schedule</span>
            Hoje
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              {todayHours > 0 ? `${todayHours}h` : ''}{todayMins > 0 ? `${todayMins}m` : todayHours === 0 ? '0m' : ''}
            </span>
          </div>
        </div>

        {/* Meta Diária */}
        <div className="card p-5 flex flex-col justify-between min-h-[120px] group">
          <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">
            <span className="material-symbols-outlined text-[16px] text-accent">task_alt</span>
            Progresso
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-display font-bold text-accent tracking-tight">{progressPct}%</span>
              <span className="text-xs text-[var(--text-muted)] font-medium">{todayPlansDone}/{totalPlans}</span>
            </div>
            <div className="progress-bar mt-2.5 h-1.5 bg-[var(--bg-subtle)]">
              <div className="progress-bar-fill shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Total Semanal */}
        <div className="card p-5 flex flex-col justify-between min-h-[120px] group">
          <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)]">
            <span className="material-symbols-outlined text-[16px] text-[var(--text-secondary)] group-hover:text-accent transition-colors">calendar_month</span>
            Semana
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
              {weekHours}h{weekMins > 0 ? ` ${weekMins}m` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Heatmap ─── */}
      <StudyHeatmap sessions={yearSessions} />

      {/* ─── Two Column: Plans + Sessions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Plan */}
        <section className="card flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-accent">fact_check</span>
              Plano de Hoje
            </h3>
            <span className="text-[10px] font-label text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-base)] px-2 py-1 rounded-card border border-[var(--border)]">
              {todayPlansDone}/{totalPlans} feitas
            </span>
          </div>
          <div className="p-2 flex-1">
            {plans?.slice(0, 5).map((plan) => (
              <div
                key={plan.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-card transition-colors hover:bg-[var(--bg-subtle)] group',
                  plan.status === 'done' && 'opacity-50'
                )}
              >
                <button
                  onClick={() => updatePlan.mutate({ id: plan.id, updates: { status: plan.status === 'done' ? 'pending' : 'done' } })}
                  className={clsx(
                    'w-[20px] h-[20px] rounded-[4px] border flex items-center justify-center shrink-0 transition-all shadow-sm',
                    plan.status === 'done'
                      ? 'bg-accent border-accent text-[var(--text-inverted)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-accent group-hover:bg-[var(--bg-base)]'
                  )}
                >
                  {plan.status === 'done' && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <span className={clsx(
                  'text-sm flex-1 min-w-0 truncate font-medium transition-colors',
                  plan.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                )}>
                  {plan.task}
                </span>
                {plan.priority === 'high' && (
                  <span className="w-2 h-2 rounded-full bg-danger shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Alta prioridade" />
                )}
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="text-center py-10 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-[var(--text-muted)] opacity-50">event_available</span>
                <span className="text-[var(--text-muted)] text-sm">Nenhuma tarefa para hoje</span>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]">
            <button
              onClick={() => navigate('/plans')}
              className="w-full py-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-accent hover:bg-[var(--accent-muted)] rounded-card transition-all border border-dashed border-[var(--border)] hover:border-accent flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Adicionar Tarefa
            </button>
          </div>
        </section>

        {/* Recent + Reviews */}
        <div className="space-y-6 flex flex-col">
          {/* Recent Sessions */}
          <section className="card flex flex-col overflow-hidden flex-1">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <h3 className="text-base font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--text-secondary)]">history</span>
                Sessões Recentes
              </h3>
            </div>
            <div className="p-2 flex-1">
              {sessions?.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-card hover:bg-[var(--bg-subtle)] transition-colors group border border-transparent hover:border-[var(--border)]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-card bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-sm group-hover:border-accent/30 transition-colors">
                      <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-accent text-[20px] transition-colors">
                        {session.session_type === 'pomodoro' ? 'timer' : 'psychology'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{session.topic || 'Sessão de Foco'}</h4>
                      <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                        {session.started_at ? format(new Date(session.started_at), "HH:mm") : ''} · {session.session_type === 'pomodoro' ? 'Pomodoro' : 'Contínua'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold text-[var(--text-primary)] shrink-0 ml-4 bg-[var(--bg-base)] px-2.5 py-1 rounded-card border border-[var(--border)]">
                    {Math.floor((session.duration_minutes || 0) / 60)}h {(session.duration_minutes || 0) % 60}m
                  </span>
                </div>
              ))}
              {(!sessions || sessions.length === 0) && (
                <div className="text-center py-10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-[var(--text-muted)] opacity-50">hourglass_empty</span>
                  <span className="text-[var(--text-muted)] text-sm">Nenhuma sessão hoje</span>
                </div>
              )}
            </div>
          </section>

          {/* Pending Reviews */}
          {pendingReviews && pendingReviews.length > 0 && (
            <section className="card p-5 border-l-4 border-l-gold relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gold/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-display font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gold">auto_stories</span>
                    Revisões Pendentes
                  </h3>
                  <span className="badge badge-gold bg-[var(--bg-base)] border border-gold/20 px-2 py-0.5 rounded-full">{pendingReviews.length}</span>
                </div>
                <div className="space-y-2 mb-4">
                  {pendingReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-center gap-3 p-2.5 rounded-card bg-[var(--bg-base)] border border-[var(--border)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span className="text-sm text-[var(--text-primary)] font-medium truncate flex-1">{review.topic}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/reviews')}
                  className="text-xs font-semibold text-gold hover:text-gold-bright hover:underline flex items-center gap-1 transition-colors"
                >
                  Ver todas as revisões
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}