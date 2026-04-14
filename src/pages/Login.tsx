import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-lowest">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-dim via-surface to-surface-dim" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl flow-gradient shadow-glow mb-6">
            <span className="text-3xl font-headline font-bold text-on-primary">SF</span>
          </div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface mb-3">
            StudyFlow
          </h1>
          <p className="text-on-surface-variant text-lg">
            Santuário Digital para o Foco
          </p>
        </div>

        <div className="relative bg-surface-container-low/80 backdrop-blur-xl rounded-2xl shadow-elevated border border-outline-variant/10 p-8 animate-slideUp">
          <div className="space-y-3 mb-8">
            {[
              { icon: 'timer', color: 'from-primary to-primary-container', text: 'Timer Pomodoro Inteligente' },
              { icon: 'edit_note', color: 'from-secondary to-secondary-container', text: 'Planejamento Diário Detalhado' },
              { icon: 'sync', color: 'from-emerald-500 to-green-500', text: 'Revisão Espaçada Integrada' },
              { icon: 'wifi_off', color: 'from-slate-500 to-slate-600', text: 'Modo Offline Disponível' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-high transition-all duration-300 group cursor-default">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-lg">{feature.icon}</span>
                </div>
                <span className="text-on-surface font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="relative w-full flow-gradient text-on-primary py-4 px-6 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Conectando...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.3 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Entrar com Google</span>
              </span>
            )}
          </button>

          <p className="text-xs text-outline text-center mt-6">
            Ao entrar, você concorda com nossos{' '}
            <a href="#" className="text-primary hover:underline">Termos de Uso</a>
          </p>
        </div>

        <div className="text-center mt-8 animate-fadeIn">
          <p className="text-outline text-sm">
            Transforme sua rotina de estudos
          </p>
        </div>
      </div>
    </div>
  )
}