import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/auth'
import { initTheme } from './store/theme'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import { PageLoading } from './components/Loading'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Plans from './pages/Plans'
import Reviews from './pages/Reviews'
import Timer from './pages/Timer'
import Goals from './pages/Goals'
import Reset from './pages/Reset'
import './index.css'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" />
}

// Ensure the auth user exists in public.users (required for FK constraints)
async function ensurePublicUser(authUser: any) {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (!existingUser) {
      const { error: insertError } = await supabase.from('users').insert({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email || '',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        google_id: authUser.user_metadata?.provider_id || authUser.id,
        updated_at: new Date().toISOString(),
      })
      if (insertError) {
        console.warn('Failed to insert public user:', insertError)
      }
    } else {
      const { error: updateError } = await supabase.from('users').update({
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email || '',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      }).eq('id', authUser.id)
      
      if (updateError) {
        console.info('Could not update user profile (might be restricted by RLS):', updateError)
      }
    }
  } catch (e) {
    console.warn('Failed to sync public user:', e)
  }
}

function buildUser(authUser: any, createdAt: string, updatedAt: string) {
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
    avatar_url: authUser.user_metadata?.avatar_url || null,
    google_id: authUser.user_metadata?.provider_id || '',
    streak_count: 0,
    streak_last_date: null,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function AuthSync({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const { setUser, logout } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session?.user) {
          supabase.auth.signOut().catch(() => {})
          logout()
        } else {
          await ensurePublicUser(session.user)
          const user = buildUser(
            session.user,
            session.user.created_at || new Date().toISOString(),
            session.user.updated_at || new Date().toISOString()
          )
          setUser(user, session.access_token)
        }
      } catch (err) {
        console.error('Initialization auth error:', err)
        logout()
      } finally {
        if (mounted) setReady(true)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Note: INITIAL_SESSION is handled explicitly by initAuth above
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT' || !session?.user) {
        logout()
        queryClient.clear()
        return
      }

      if (event === 'SIGNED_IN') {
         await ensurePublicUser(session.user)
      }

      const user = buildUser(
        session.user,
        session.user.created_at || new Date().toISOString(),
        session.user.updated_at || new Date().toISOString()
      )
      setUser(user, session.access_token)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, logout])

  if (!ready) return <PageLoading />
  return <>{children}</>
}


function App() {
  initTheme()
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ToastProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/timer" element={<Timer />} />
                        <Route path="/goals" element={<Goals />} />
                      </Routes>
                    </Layout>
                  </ToastProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthSync>
    </QueryClientProvider>
  )
}

export default App