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
import './index.css'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function AuthSync({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const { setUser, logout } = useAuthStore()

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      } else {
        logout()
      }
      setReady(true)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      } else {
        logout()
        queryClient.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, logout])

  if (!ready) return <PageLoading />
  return <>{children}</>
}

function App() {
  initTheme()
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
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