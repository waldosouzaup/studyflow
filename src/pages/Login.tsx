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
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-base">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gold/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-card bg-accent shadow-accent mb-5">
            <span className="text-xl font-display font-bold text-[var(--text-inverted)]">UP</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight mb-2">
            UP Estudos
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Foco em resultados. Domine suas certificações.
          </p>
        </div>

        {/* Card */}
        <div className="card p-6 lg:p-8 animate-slideUp">
          {/* Features */}
          <div className="space-y-2 mb-6">
            {[
              { icon: 'target', text: 'Trilhas de certificação' },
              { icon: 'timer', text: 'Sessões com foco total' },
              { icon: 'replay', text: 'Revisão espaçada inteligente' },
              { icon: 'trending_up', text: 'Progresso em tempo real' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-sharp hover:bg-[var(--bg-subtle)] transition-colors">
                <div className="w-8 h-8 rounded-sharp bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-accent text-[16px]">{feature.icon}</span>
                </div>
                <span className="text-sm text-[var(--text-primary)]">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Nome</label>
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

            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-label uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Senha</label>
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
              <div className="p-3 bg-[var(--danger-muted)] text-danger text-sm rounded-sharp">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full btn-accent py-3.5 text-sm font-bold overflow-hidden group mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processando...
                </span>
              ) : (
                <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-sm text-accent hover:underline"
            >
              {isLogin ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
            </button>
          </div>

          <p className="text-[10px] text-[var(--text-muted)] text-center mt-5">
            Ao entrar, você concorda com nossos{' '}
            <a href="#" className="text-accent hover:underline">Termos de Uso</a>
          </p>
        </div>

        <div className="text-center mt-6 animate-fadeIn">
          <p className="text-[var(--text-muted)] text-xs">Domine. Evolua. Conquiste.</p>
        </div>
      </div>
    </div>
  )
}