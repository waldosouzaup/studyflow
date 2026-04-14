import { useState, useEffect, useRef, useCallback } from 'react'
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
    if (activeSession && !activeSession.finishedAt) {
      setSessionState(activeSession.pausedAt ? 'paused' : 'active')
      setSelectedSubject(activeSession.subjectId)
      setStartedAt(activeSession.startedAt)
      const startTime = new Date(activeSession.startedAt).getTime()
      const pausedDuration = activeSession.pausedAt
        ? new Date(activeSession.pausedAt).getTime() - startTime
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
    setStartedAt(now)
    setElapsedSeconds(0)
    totalPausedTime.current = 0
    
    const sessionData = {
      id: crypto.randomUUID(),
      userId,
      subjectId: selectedSubject,
      date: now.split('T')[0],
      startedAt: now,
      finishedAt: null,
      pausedAt: null,
      durationMinutes: 0,
      topic: null,
      notes: null,
      difficulty: null,
      focus: null,
      sessionType,
      isOfflineSync: false,
      createdAt: now,
    }
    
    try {
      await createSession.mutateAsync(sessionData)
      setSessionState('active')
    } catch (err) {
      await saveOfflineSession(sessionData)
      setSessionState('active')
    }
  }

  const pauseSession = useCallback(async () => {
    if (!activeSession) return
    setSessionState('paused')
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: { pausedAt: new Date().toISOString() },
      })
    } catch (err) {
      console.error(err)
    }
  }, [activeSession, updateSession])

  const resumeSession = useCallback(async () => {
    if (!activeSession || !startedAt) return
    const pausedAt = activeSession.pausedAt
    if (pausedAt) {
      const pauseDuration = Date.now() - new Date(pausedAt).getTime()
      totalPausedTime.current += pauseDuration
    }
    setSessionState('active')
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: { pausedAt: null },
      })
    } catch (err) {
      console.error(err)
    }
  }, [activeSession, startedAt, updateSession])

  const finishSession = async () => {
    const durationMinutes = Math.floor(elapsedSeconds / 60)
    if (durationMinutes < 5) {
      alert('Sessão deve ter pelo menos 5 minutos')
      return
    }
    if (!activeSession) return
    
    try {
      await updateSession.mutateAsync({
        id: activeSession.id,
        updates: {
          finishedAt: new Date().toISOString(),
          durationMinutes,
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
        userId: activeSession.userId,
        subjectId: selectedSubject,
        sessionId: activeSession.id,
        topic: topic || 'Revisão',
        reviewDate: reviewDate.toISOString().split('T')[0],
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Timer de Estudo</h2>

      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className={`text-6xl font-mono mb-8 ${
          sessionState === 'paused' ? 'text-yellow-600' : ''
        }`}>
          {formatTime(elapsedSeconds)}
        </div>

        {sessionState === 'idle' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Assunto</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border rounded-lg"
                disabled={isLoading}
              >
                <option value="">Selecione um assunto</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Modo</label>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setSessionType('free')}
                  className={`px-4 py-2 rounded-lg ${
                    sessionType === 'free'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Livre
                </button>
                <button
                  onClick={() => setSessionType('pomodoro')}
                  className={`px-4 py-2 rounded-lg ${
                    sessionType === 'pomodoro'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Pomodoro (25min)
                </button>
              </div>
            </div>
          </div>
        )}

        {sessionState === 'idle' && (
          <button
            onClick={startSession}
            disabled={!selectedSubject || isLoading}
            className="w-full py-4 bg-green-600 text-white text-xl rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar Sessão'}
          </button>
        )}

        {(sessionState === 'active' || sessionState === 'paused') && (
          <div className="flex gap-4 justify-center">
            {sessionState === 'paused' ? (
              <button
                onClick={resumeSession}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Retomando...' : 'Retomar'}
              </button>
            ) : (
              <button
                onClick={pauseSession}
                disabled={isLoading}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                Pausar
              </button>
            )}
            <button
              onClick={finishSession}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Finalizar
            </button>
          </div>
        )}

        {sessionState === 'finished' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tópico</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="O que você estudou?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Observações..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dificuldade (1-3)</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setDifficulty(n)}
                      className={`flex-1 py-2 rounded ${
                        difficulty === n
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Foco (1-3)</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFocus(n)}
                      className={`flex-1 py-2 rounded ${
                        focus === n ? 'bg-blue-600 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Agendar revisão?</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => createReviewFromSession(1)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  1 dia
                </button>
                <button
                  onClick={() => createReviewFromSession(7)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  7 dias
                </button>
                <button
                  onClick={() => createReviewFromSession(30)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  30 dias
                </button>
              </div>
            </div>
            <button
              onClick={resetTimer}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Nova Sessão
            </button>
          </div>
        )}
      </div>

      {subjects?.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          Crie um assunto primeiro em Assuntos
        </p>
      )}
    </div>
  )
}