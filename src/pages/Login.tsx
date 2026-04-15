import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })
        if (error) throw error
        alert('Conta criada! Verifique seu email para confirmar.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar requisição')
    } finally {
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full"
                  placeholder="Seu nome"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-[0.15em] text-outline">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 text-error text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
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
                  <span>Processando...</span>
                </span>
              ) : (
                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
            </button>
          </div>

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