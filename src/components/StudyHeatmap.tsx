import { useMemo } from 'react'
import { format, eachDayOfInterval, getDay, subWeeks, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HeatmapProps {
  sessions: { date: string; duration_minutes: number }[] | undefined
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0
  if (minutes < 30) return 1
  if (minutes < 60) return 2
  if (minutes < 120) return 3
  return 4
}

const INTENSITY_COLORS = [
  'bg-[var(--bg-base)] border border-[var(--border)]',
  'bg-accent/20 border border-accent/10',
  'bg-accent/40 border border-accent/20',
  'bg-accent/70 border border-accent/30',
  'bg-accent shadow-[0_0_8px_rgba(16,185,129,0.4)]',
]

export default function StudyHeatmap({ sessions }: HeatmapProps) {
  const { grid, monthLabels, totalMinutes, activeDays } = useMemo(() => {
    const today = new Date()
    const weeksToShow = 52
    const gridStart = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: gridStart, end: today })

    const minutesByDate = new Map<string, number>()
    sessions?.forEach((s) => {
      const dateKey = s.date.split('T')[0]
      minutesByDate.set(dateKey, (minutesByDate.get(dateKey) || 0) + (s.duration_minutes || 0))
    })

    const weeks: { date: Date; minutes: number; dayOfWeek: number }[][] = []
    let currentWeek: { date: Date; minutes: number; dayOfWeek: number }[] = []

    days.forEach((day) => {
      const dow = getDay(day)
      if (dow === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      const dateStr = format(day, 'yyyy-MM-dd')
      currentWeek.push({
        date: day,
        minutes: minutesByDate.get(dateStr) || 0,
        dayOfWeek: dow,
      })
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)

    const labels: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, weekIdx) => {
      const firstDay = week[0]?.date
      if (firstDay) {
        const month = firstDay.getMonth()
        if (month !== lastMonth) {
          labels.push({ label: MONTHS[month], weekIndex: weekIdx })
          lastMonth = month
        }
      }
    })

    let totalMin = 0
    let active = 0
    minutesByDate.forEach((min) => {
      totalMin += min
      if (min > 0) active++
    })

    return { grid: weeks, monthLabels: labels, totalMinutes: totalMin, activeDays: active }
  }, [sessions])

  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[var(--text-secondary)] text-[20px]">calendar_view_week</span>
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-[var(--text-primary)]">Mapa de Atividade</h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Últimos 12 meses</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--bg-base)] px-3 py-1.5 rounded-card border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-label">Dias ativos</span>
            <span className="text-sm font-display font-bold text-[var(--text-primary)]">{activeDays}</span>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-base)] px-3 py-1.5 rounded-card border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-label">Total</span>
            <span className="text-sm font-display font-bold text-accent">
              {totalHours}h {totalMins}m
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-x-auto pb-4">
        <div className="min-w-[720px]">
          {/* Month labels */}
          <div className="flex mb-1.5 pl-7">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[9px] font-label text-[var(--text-muted)] uppercase tracking-wider"
                style={{
                  position: 'relative',
                  left: `${m.weekIndex * 14}px`,
                  marginRight: i < monthLabels.length - 1
                    ? `${(monthLabels[i + 1]?.weekIndex - m.weekIndex) * 14 - 28}px`
                    : 0,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 justify-start">
              {['', 'Seg', '', 'Qua', '', 'Sex', ''].map((label, i) => (
                <div key={i} className="h-[11px] flex items-center">
                  <span className="text-[8px] font-label text-[var(--text-muted)] w-5 text-right">{label}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const cell = week.find((d) => d.dayOfWeek === dayIdx)
                  if (!cell) return <div key={dayIdx} className="w-[11px] h-[11px]" />
                  const intensity = getIntensity(cell.minutes)
                  return (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-[3px] transition-all duration-300 ${INTENSITY_COLORS[intensity]} hover:ring-2 hover:ring-accent hover:ring-offset-1 hover:ring-offset-[var(--bg-raised)] hover:scale-125 hover:z-10 relative cursor-default`}
                      title={`${format(cell.date, 'd MMM yyyy', { locale: ptBR })}: ${cell.minutes > 0 ? `${Math.floor(cell.minutes / 60)}h ${cell.minutes % 60}m` : 'Sem estudo'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <span className="text-[8px] font-label text-[var(--text-muted)]">Menos</span>
            {INTENSITY_COLORS.map((cls, i) => (
              <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[8px] font-label text-[var(--text-muted)]">Mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
