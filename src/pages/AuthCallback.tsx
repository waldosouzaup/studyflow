import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import { PageLoading } from '../components/Loading'

export default function AuthCallback() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || '',
          avatarUrl: session.user.user_metadata?.avatar_url || null,
          googleId: session.user.user_metadata?.provider_id || '',
          streakCount: 0,
          streakLastDate: null,
          createdAt: session.user.created_at || new Date().toISOString(),
          updatedAt: session.user.updated_at || new Date().toISOString(),
        }
        setUser(user, session.access_token)
        navigate('/')
      } else if (error) {
        console.error(error)
        navigate('/login')
      }
    }
    handleCallback()
  }, [navigate, setUser])

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-sm flex flex-col items-center">
        <PageLoading />
        <div className="mt-8 text-center space-y-2 opacity-50">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-text-primary">Validando Credenciais</p>
          <p className="text-[8px] font-mono text-text-tertiary uppercase tracking-widest leading-relaxed">Protocolo de Segurança Ativo</p>
        </div>
      </div>
    </div>
  )
}