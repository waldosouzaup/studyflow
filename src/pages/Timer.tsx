import { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSubjects } from '../hooks/useSubjects'
import { useCreateSession, useActiveSession, useUpdateSession } from '../hooks/useSessions'
import { useCreateReview } from '../hooks/useReviews'
import { useAuthStore } from '../store/auth'
import { PageLoading } from '../components/Loading'
import { saveOfflineSession } from '../lib/indexeddb'

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

  const intervalRef = useRef<number | undefined>(undefined)
  const totalPausedTime = useRef(0)

  useEffect(() => {
    if (activeSession && !activeSession.finished_at) {
      setSessionState(activeSession.paused_at ? 'paused' : 'active')
      setSelectedSubject(activeSession.subject_id)
      setStartedAt(activeSession.started_at)
      const startTime = new Date(activeSession.started_at).getTime()
      const pausedDuration = activeSession.paused_at
        ? new Date(activeSession.paused_at).getTime() - startTime
        : 0
      totalPausedTime.current = pausedDuration
      setElapsedSeconds(Math.floor((Date.now() - startTime - pausedDuration) / 1000))
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
      id: sessionId,
      user_id: userId,
      subject_id: selectedSubject,
      date: now.split('T')[0],
      started_at: now,
      finished_at: null,
      paused_at: null,
      duration_minutes: 0,
      topic: null,
      notes: null,
      difficulty: null,
      focus: null,
      session_type: sessionType,
      is_offline_sync: false,
    }
    
    try {
      console.log(`[Timer] Inicando sessão ${sessionType}:`, sessionData)
      await createSession.mutateAsync(sessionData)
      setSessionState('active')
    } catch (err: any) {
      console.error('[Timer] Falha ao criar sessão no servidor:', err)
      // Se falhar no servidor, tentamos salvar localmente
      try {
        await saveOfflineSession(sessionData)
        setSessionState('active')
        console.log('[Timer] Sessão salva em modo offline com ID:', sessionId)
      } catch (offlineErr) {
        console.error('[Timer] Falha crítica: não foi possível salvar nem offline:', offlineErr)
        alert('Erro ao iniciar sessão. Verifique sua conexão.')
        // Resetamos o estado pois não conseguimos iniciar de nenhuma forma
        setStartedAt(null)
      }
    }
  }

  const pauseSession = useCallback(async () => {
    if (!activeSession) return
    setSessionState('paused')
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: { paused_at: new Date().toISOString() },
      })
    } catch (err) {
      console.error(err)
    }
  }, [activeSession, updateSession])

  const resumeSession = useCallback(async () => {
    if (!activeSession || !startedAt) return
    const paused_at = activeSession.paused_at
    if (paused_at) {
      const pauseDuration = Date.now() - new Date(paused_at).getTime()
      totalPausedTime.current += pauseDuration
    }
    setSessionState('active')
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: { paused_at: null },
      })
    } catch (err) {
      console.error(err)
    }
  }, [activeSession, startedAt, updateSession])

  const finishSession = async () => {
    const durationMinutes = Math.floor(elapsedSeconds / 60)
    if (durationMinutes < 1) {
      alert('A sessão deve ter pelo menos 1 minuto para ser registrada')
      return
    }
    if (!activeSession) return
    
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: {
          finished_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          topic: topic || null,
          notes: notes || null,
          difficulty,
          focus,
        },
      })
      setSessionState('finished')
    } catch (err) {
      alert('Erro ao finalizar sessão')
    }
  }

  const createReviewFromSession = async (intervalDays: number) => {
    if (!activeSession) return
    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + intervalDays)
    try {
      await createReview.mutateAsync({
        user_id: activeSession.user_id,
        subject_id: selectedSubject,
        session_id: activeSession.id,
        topic: topic || 'Revisão',
        review_date: reviewDate.toISOString().split('T')[0],
        status: 'pending',
      })
      alert('Revisão agendada!')
    } catch (err) {
      alert('Erro ao criar revisão')
    }
  }

  const resetTimer = () => {
    setSessionState('idle')
    setSelectedSubject('')
    setElapsedSeconds(0)
    setStartedAt(null)
    setTopic('')
    setNotes('')
    setDifficulty(2)
    setFocus(2)
    totalPausedTime.current = 0
  }

  if (subjectsLoading || activeLoading) return <PageLoading />

  const isLoading = createSession.isPending || updateSession.isPending

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs font-label uppercase tracking-[0.15em] text-outline block">Modo Foco</span>
        <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Sessão de Estudo</h1>
      </div>

      <div className="surface-card p-12 flex flex-col items-center relative overflow-hidden">
        {sessionState === 'paused' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
        )}
        
        <div className={`text-[120px] md:text-[160px] font-headline font-thin tracking-tighter leading-none mb-8 timer-glow ${
          sessionState === 'paused' ? 'text-outline opacity-50' : 'text-on-surface'
        }`}>
          {formatTime(elapsedSeconds)}
        </div>

        {sessionState === 'idle' && (
          <div className="w-full max-w-sm space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Selecionar Assunto</label>
              <div className="relative group">
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
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Tipo de Sessão</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSessionType('free')}
                  className={`py-3 px-4 text-sm font-medium transition-all rounded-lg border ${
                    sessionType === 'free'
                      ? 'flow-gradient text-on-primary border-transparent'
                      : 'bg-surface-container-highest text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  Contínua
                </button>
                <button
                  onClick={() => setSessionType('pomodoro')}
                  className={`py-3 px-4 text-sm font-medium transition-all rounded-lg border ${
                    sessionType === 'pomodoro'
                      ? 'flow-gradient text-on-primary border-transparent'
                      : 'bg-surface-container-highest text-on-surface-variant border-outline-variant hover:border-primary'
                  }`}
                >
                  Pomodoro
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10">
              <button
                onClick={startSession}
                disabled={!selectedSubject || isLoading}
                className="w-full py-4 flow-gradient text-on-primary text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sessão'}
              </button>
            </div>
          </div>
        )}

        {(sessionState === 'active' || sessionState === 'paused') && (
          <div className="flex items-center gap-8 animate-scaleIn">
            <button
              onClick={pauseSession}
              disabled={isLoading || !activeSession}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all active:scale-90 border border-outline-variant/10 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">pause</span>
            </button>
            <button
              onClick={finishSession}
              disabled={isLoading || !activeSession}
              className="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-5xl">stop</span>
            </button>
            {sessionState === 'paused' && (
              <button
                onClick={resumeSession}
                disabled={isLoading || !activeSession}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-primary/10 transition-all active:scale-90 border border-primary/20 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
              </button>
            )}
          </div>
        )}

        {sessionState === 'finished' && (
          <div className="w-full max-w-md space-y-6 animate-slideUp">
            <div className="pb-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-headline font-bold text-primary">Sessão Concluída</h3>
              <p className="text-sm text-on-surface-variant mt-1">Adicione notas e parâmetros sobre esta sessão.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Tópico</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input w-full"
                  placeholder="Ex: Resolvi exercícios de cálculo"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Anotações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input w-full resize-none"
                  rows={3}
                  placeholder="Descobertas ou dificuldades..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline text-center">Dificuldade</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setDifficulty(n)}
                        className={`flex-1 py-3 text-sm font-mono font-bold rounded-lg border transition-all ${
                          difficulty === n
                            ? 'bg-on-surface text-surface border-on-surface'
                            : 'bg-surface-container-highest text-outline border-outline-variant hover:text-on-surface'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-label uppercase tracking-[0.15em] text-outline text-center">Foco</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFocus(n)}
                        className={`flex-1 py-3 text-sm font-mono font-bold rounded-lg border transition-all ${
                          focus === n 
                            ? 'bg-primary text-on-primary border-primary' 
                            : 'bg-surface-container-highest text-outline border-outline-variant hover:text-on-surface'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/10">
                <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline mb-4 text-center">Agendar Revisão</label>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => createReviewFromSession(1)}
                    className="px-5 py-2 rounded-lg border border-outline-variant/20 text-xs font-label uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                  >
                    1 dia
                  </button>
                  <button
                    onClick={() => createReviewFromSession(7)}
                    className="px-5 py-2 rounded-lg border border-outline-variant/20 text-xs font-label uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                  >
                    7 dias
                  </button>
                  <button
                    onClick={() => createReviewFromSession(30)}
                    className="px-5 py-2 rounded-lg border border-outline-variant/20 text-xs font-label uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
                  >
                    30 dias
                  </button>
                </div>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={resetTimer}
                  className="py-3 px-6 text-sm font-medium text-outline hover:text-on-surface transition-colors"
                >
                  Nova Sessão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div 
        onClick={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          }
        }}
        className="fixed bottom-10 right-10 bg-surface-container-highest/80 backdrop-blur-md p-4 rounded-full border border-outline-variant/20 group hover:bg-primary transition-all active:scale-95 z-50 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined group-hover:text-on-primary">visibility_off</span>
          <span className="font-label text-xs font-bold uppercase tracking-widest hidden group-hover:block text-on-primary">Modo Zen</span>
        </div>
      </div>

      {subjects?.length === 0 && (
        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 text-center text-sm text-outline">
          Nenhum assunto cadastrado. <a href="/subjects" className="text-primary hover:underline">Adicionar assunto</a>
        </div>
      )}
    </div>
  )
}