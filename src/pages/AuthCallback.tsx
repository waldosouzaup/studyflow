import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'

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

  return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
}