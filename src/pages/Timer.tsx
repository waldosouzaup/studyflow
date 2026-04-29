import { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSubjects } from '../hooks/useSubjects'
import { useCreateSession, useActiveSession, useUpdateSession } from '../hooks/useSessions'
import { useCreateReview } from '../hooks/useReviews'
import { useAuthStore } from '../store/auth'
import { PageLoading } from '../components/Loading'
import { saveOfflineSession } from '../lib/indexeddb'
import clsx from 'clsx'

type SessionState = 'idle' | 'active' | 'paused' | 'finished'

export default function Timer() {
  const userId = useAuthStore((s) => s.user?.id) || ''
  const { data: subjects, isLoading: subjectsLoading } = useSubjects()
  const { data: activeSession, isLoading: activeLoading } = useActiveSession()
  const createSession = useCreateSession()
  const updateSession = useUpdateSession()
  const createReview = useCreateReview()

  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [sessionType, setSessionType] = useState<'free' | 'pomodoro'>('free')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [difficulty, setDifficulty] = useState(2)
  const [focus, setFocus] = useState(2)
  const [localSessionId, setLocalSessionId] = useState<string | null>(null)

  const intervalRef = useRef<number | undefined>(undefined)
  const totalPausedTime = useRef(0)

  useEffect(() => {
    if (activeSession && !activeSession.finished_at) {
      const isPaused = !!activeSession.paused_at
      setSessionState(isPaused ? 'paused' : 'active')
      setSelectedSubject(activeSession.subject_id)
      setStartedAt(activeSession.started_at)
      const startTime = new Date(activeSession.started_at).getTime()
      const now = Date.now()
      if (isPaused) {
        const pauseTime = new Date(activeSession.paused_at!).getTime()
        setElapsedSeconds(Math.floor((pauseTime - startTime) / 1000))
        totalPausedTime.current = now - pauseTime
      } else {
        const currentElapsed = Math.floor((now - startTime - totalPausedTime.current) / 1000)
        setElapsedSeconds(currentElapsed > 0 ? currentElapsed : 0)
      }
      if (activeSession.topic) setTopic(activeSession.topic)
      if (activeSession.notes) setNotes(activeSession.notes)
      if (activeSession.difficulty) setDifficulty(activeSession.difficulty)
      if (activeSession.focus) setFocus(activeSession.focus)
    }
  }, [activeSession])

  useEffect(() => {
    if (sessionState === 'active') {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now()
        const start = startedAt ? new Date(startedAt).getTime() : now
        setElapsedSeconds(Math.floor((now - start - totalPausedTime.current) / 1000))
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [sessionState, startedAt])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const startSession = async () => {
    if (!selectedSubject || !userId) return
    const now = new Date().toISOString()
    const sessionId = uuidv4()
    setStartedAt(now)
    setElapsedSeconds(0)
    totalPausedTime.current = 0
    const sessionData = {
      id: sessionId, user_id: userId, subject_id: selectedSubject,
      date: now.split('T')[0], started_at: now, finished_at: null, paused_at: null,
      duration_minutes: 0, topic: null, notes: null, difficulty: null, focus: null,
      session_type: sessionType, is_offline_sync: false,
    }
    try {
      await createSession.mutateAsync(sessionData)
      setLocalSessionId(sessionId)
      setSessionState('active')
    } catch (err) {
      try {
        await saveOfflineSession(sessionData)
        setLocalSessionId(sessionId)
        setSessionState('active')
      } catch {
        alert('Erro ao iniciar sessão.')
        setStartedAt(null)
      }
    }
  }

  const pauseSession = useCallback(async () => {
    const sessionId = activeSession?.id || localSessionId
    if (!sessionId) return
    setSessionState('paused')
    try {
      await updateSession.mutateAsync({ id: sessionId, updates: { paused_at: new Date().toISOString() } })
    } catch (err) { console.error('[Timer] Erro ao pausar:', err) }
  }, [activeSession, localSessionId, updateSession])

  const resumeSession = useCallback(async () => {
    const sessionId = activeSession?.id || localSessionId
    if (!sessionId || !startedAt) return
    const paused_at = activeSession?.paused_at
    if (paused_at) {
      totalPausedTime.current += Date.now() - new Date(paused_at).getTime()
    }
    setSessionState('active')
    try {
      await updateSession.mutateAsync({ id: sessionId, updates: { paused_at: null } })
    } catch (err) { console.error('[Timer] Erro ao retomar:', err) }
  }, [activeSession, localSessionId, startedAt, updateSession])

  const finishSession = async () => {
    const durationMinutes = Math.floor(elapsedSeconds / 60)
    if (durationMinutes < 1) { alert('Sessão deve ter pelo menos 1 minuto.'); return }
    const sessionId = activeSession?.id || localSessionId
    if (!sessionId) return
    try {
      await updateSession.mutateAsync({
        id: sessionId,
        updates: { finished_at: new Date().toISOString(), duration_minutes: durationMinutes, topic: topic || null, notes: notes || null, difficulty, focus },
      })
      setSessionState('finished')
    } catch { alert('Erro ao finalizar sessão.') }
  }

  const createReviewFromSession = async (intervalDays: number) => {
    const sessionId = activeSession?.id || localSessionId
    if (!sessionId) return
    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + intervalDays)
    try {
      await createReview.mutateAsync({
        user_id: activeSession?.user_id || userId, subject_id: selectedSubject,
        session_id: sessionId, topic: topic || 'Revisão',
        review_date: reviewDate.toISOString().split('T')[0], status: 'pending',
      })
      alert('Revisão agendada!')
    } catch { alert('Erro ao criar revisão') }
  }

  const resetTimer = () => {
    setSessionState('idle'); setSelectedSubject(''); setElapsedSeconds(0); setStartedAt(null)
    setTopic(''); setNotes(''); setDifficulty(2); setFocus(2); setLocalSessionId(null)
    totalPausedTime.current = 0
  }

  if (subjectsLoading || activeLoading) return <PageLoading />
  const isLoading = createSession.isPending || updateSession.isPending
  const selectedSubjectData = subjects?.find(s => s.id === selectedSubject)
  const difficultyLabels = ['Fácil', 'Médio', 'Difícil']
  const focusLabels = ['Baixo', 'Normal', 'Alto']

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* ─── Header ─── */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-label uppercase tracking-[0.15em] text-[var(--text-muted)]">Modo Foco</span>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight mt-1">Sessão de Estudo</h1>
      </div>

      {/* ─── Timer Card ─── */}
      <div className="card p-8 lg:p-12 flex flex-col items-center relative overflow-hidden">
        {/* Active/Paused indicator */}
        {sessionState === 'active' && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-accent animate-pulseGlow" />
        )}
        {sessionState === 'paused' && (
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gold animate-pulse" />
        )}

        {/* Subject badge */}
        {selectedSubjectData && sessionState !== 'idle' && (
          <div className="mb-6 badge badge-accent text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: selectedSubjectData.color }} />
            {selectedSubjectData.name}
          </div>
        )}

        {/* Timer display */}
        <div className={clsx(
          'font-display font-bold tracking-tighter leading-none mb-8 transition-all',
          sessionState === 'paused'
            ? 'text-[var(--text-muted)] text-[80px] lg:text-[120px]'
            : sessionState === 'active'
            ? 'text-accent text-[80px] lg:text-[120px]'
            : 'text-[var(--text-primary)] text-[72px] lg:text-[100px]'
        )}>
          {formatTime(elapsedSeconds)}
        </div>

        {/* ─── IDLE State ─── */}
        {sessionState === 'idle' && (
          <div className="w-full max-w-sm space-y-5 animate-fadeIn">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Assunto
              </label>
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input w-full appearance-none pr-10"
                  disabled={isLoading}
                >
                  <option value="">Escolha um assunto...</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['free', 'pomodoro'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSessionType(type)}
                    className={clsx(
                      'py-2.5 px-4 text-sm font-medium rounded-card border transition-all',
                      sessionType === type
                        ? 'bg-[var(--accent-muted)] text-accent border-accent'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    {type === 'free' ? 'Contínua' : 'Pomodoro'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startSession}
              disabled={!selectedSubject || isLoading}
              className="w-full btn-accent py-3.5 text-sm font-bold shadow-accent hover:shadow-lg transition-all disabled:opacity-40"
            >
              {isLoading ? 'Iniciando...' : 'INICIAR SESSÃO'}
            </button>
          </div>
        )}

        {/* ─── ACTIVE / PAUSED Controls ─── */}
        {(sessionState === 'active' || sessionState === 'paused') && (
          <div className="flex items-center gap-5 animate-scaleIn">
            {sessionState === 'active' ? (
              <button
                onClick={pauseSession}
                disabled={isLoading || (!activeSession && !localSessionId)}
                className="w-12 h-12 flex items-center justify-center rounded-card bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all border border-[var(--border)]"
              >
                <span className="material-symbols-outlined text-xl">pause</span>
              </button>
            ) : (
              <button
                onClick={resumeSession}
                disabled={isLoading || (!activeSession && !localSessionId)}
                className="w-12 h-12 flex items-center justify-center rounded-card bg-[var(--accent-muted)] text-accent hover:bg-accent/20 transition-all border border-accent/30"
              >
                <span className="material-symbols-outlined text-xl">play_arrow</span>
              </button>
            )}

            <button
              onClick={finishSession}
              disabled={isLoading || (!activeSession && !localSessionId)}
              className="w-16 h-16 flex items-center justify-center rounded-full btn-accent shadow-accent hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined text-3xl">stop</span>
            </button>
          </div>
        )}

        {/* ─── FINISHED State ─── */}
        {sessionState === 'finished' && (
          <div className="w-full max-w-sm space-y-5 animate-slideUp">
            <div className="text-center pb-4 border-b border-[var(--border)]">
              <span className="badge badge-accent mb-2">✓ Sessão Concluída</span>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Registre como foi sua sessão.</p>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Tópico</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="input w-full" placeholder="O que você estudou?" />
            </div>

            {/* Difficulty — 3 simple buttons */}
            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-2 text-center">Dificuldade</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDifficulty(n)}
                    className={clsx(
                      'py-2.5 text-sm font-medium rounded-card border transition-all',
                      difficulty === n
                        ? n === 1 ? 'bg-accent/10 text-accent border-accent/30'
                          : n === 2 ? 'bg-gold/10 text-gold border-gold/30'
                          : 'bg-danger/10 text-danger border-danger/30'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    {difficultyLabels[n - 1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus */}
            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-2 text-center">Nível de Foco</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFocus(n)}
                    className={clsx(
                      'py-2.5 text-sm font-medium rounded-card border transition-all',
                      focus === n
                        ? 'bg-[var(--accent-muted)] text-accent border-accent/30'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    {focusLabels[n - 1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes (optional) */}
            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Notas (opcional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input w-full resize-none" rows={2} placeholder="Algo a lembrar..." />
            </div>

            {/* Review scheduling */}
            <div className="pt-4 border-t border-[var(--border)]">
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-3 text-center">Agendar Revisão</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 1, label: 'Amanhã', desc: 'Difícil' },
                  { days: 3, label: '3 dias', desc: 'Médio' },
                  { days: 7, label: '7 dias', desc: 'Fácil' },
                ].map(({ days, label, desc }) => (
                  <button
                    key={days}
                    onClick={() => createReviewFromSession(days)}
                    className="py-2.5 rounded-card border border-[var(--border)] text-center hover:border-accent hover:bg-[var(--accent-muted)] transition-all group"
                  >
                    <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-accent block">{label}</span>
                    <span className="text-[9px] text-[var(--text-muted)]">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={resetTimer} className="w-full py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Nova Sessão
            </button>
          </div>
        )}
      </div>

      {/* Zen mode FAB */}
      <div
        onClick={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
          else document.exitFullscreen?.().catch(() => {})
        }}
        className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 bg-[var(--bg-elevated)] backdrop-blur-md p-3 rounded-card border border-[var(--border)] group hover:bg-accent hover:border-accent transition-all active:scale-95 z-40 cursor-pointer shadow-md"
      >
        <span className="material-symbols-outlined text-[var(--text-secondary)] group-hover:text-[var(--text-inverted)] text-[20px]">visibility_off</span>
      </div>

      {subjects?.length === 0 && (
        <div className="card p-5 mt-6 text-center text-sm text-[var(--text-muted)] border-l-2 border-l-gold">
          Nenhum assunto cadastrado. <a href="/subjects" className="text-accent hover:underline">Adicionar assunto</a>
        </div>
      )}
    </div>
  )
}