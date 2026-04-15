import { useEffect } from 'react'

// This page clears ALL local storage and redirects to login
// Access at /reset to fix corrupted session issues
export default function Reset() {
  useEffect(() => {
    localStorage.clear()
    sessionStorage.clear()

    setTimeout(() => {
      window.location.replace('/login')
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-text-primary flex flex-col items-center justify-center gap-8 font-sans">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-[2px] bg-primary" />
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary">
          Limpando Sessão Corrompida
        </p>
        <div className="w-48 h-px bg-surface-light/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary animate-loadingBar" />
        </div>
        <p className="text-[8px] font-mono uppercase tracking-widest text-surface-light/30">
          Redirecionando para login...
        </p>
      </div>
    </div>
  )
}
