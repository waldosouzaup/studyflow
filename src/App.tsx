import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/auth'
import { initTheme } from './store/theme'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
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

function App() {
  initTheme()
  
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}

export default App