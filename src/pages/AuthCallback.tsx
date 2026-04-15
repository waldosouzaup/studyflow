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
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          google_id: session.user.user_metadata?.provider_id || '',
          streak_count: 0,
          streak_last_date: null,
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: session.user.updated_at || new Date().toISOString(),
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
    <div className="min-h-screen bg-surface-dim flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-sm flex flex-col items-center">
        <PageLoading />
        <div className="mt-8 text-center space-y-2 opacity-50">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface">Validando Credenciais</p>
          <p className="text-[8px] font-mono text-outline uppercase tracking-widest leading-relaxed">Protocolo de Segurança Ativo</p>
        </div>
      </div>
    </div>
  )
}