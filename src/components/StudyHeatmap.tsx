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

const INTENSITY_CLASSES = [
  'bg-surface-container-highest',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
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

    return {
      grid: weeks,
      monthLabels: labels,
      totalMinutes: totalMin,
      activeDays: active,
    }
  }, [sessions])

  return (
    <div className="surface-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-headline font-bold text-on-surface">Mapa de Atividade</h3>
          <p className="text-xs text-outline mt-1">Últimos 12 meses de estudo</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-outline block">Dias ativos</span>
            <span className="text-lg font-headline font-bold text-on-surface">{activeDays}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-outline block">Total</span>
            <span className="text-lg font-headline font-bold text-on-surface">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Month labels */}
          <div className="flex mb-2 pl-8">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] font-label text-outline uppercase tracking-wider"
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

          {/* Heatmap grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 justify-start">
              {['', 'Seg', '', 'Qua', '', 'Sex', ''].map((label, i) => (
                <div key={i} className="h-[12px] flex items-center">
                  <span className="text-[9px] font-label text-outline w-6 text-right">{label}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const cell = week.find((d) => d.dayOfWeek === dayIdx)
                  if (!cell) {
                    return <div key={dayIdx} className="w-[12px] h-[12px]" />
                  }
                  const intensity = getIntensity(cell.minutes)
                  return (
                    <div
                      key={dayIdx}
                      className={`w-[12px] h-[12px] rounded-[2px] transition-colors ${INTENSITY_CLASSES[intensity]} hover:ring-1 hover:ring-primary/50 cursor-default`}
                      title={`${format(cell.date, 'd MMM yyyy', { locale: ptBR })}: ${cell.minutes > 0 ? `${Math.floor(cell.minutes / 60)}h ${cell.minutes % 60}m` : 'Sem estudo'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[9px] font-label text-outline">Menos</span>
            {INTENSITY_CLASSES.map((cls, i) => (
              <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[9px] font-label text-outline">Mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
