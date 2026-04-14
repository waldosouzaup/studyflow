import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-12 right-12 z-[200] flex flex-col gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const typeLabel = {
    success: '✓ SUCESSO',
    error: '⚠ FALHA',
    info: 'ℹ INFO',
  }[toast.type]

  const typeColor = {
    success: 'text-primary',
    error: 'text-red-500',
    info: 'text-text-primary',
  }[toast.type]

  return (
    <div
      className="bg-surface-light dark:bg-surface-dark p-6 min-w-[320px] animate-scaleIn flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <span className={`text-[8px] font-bold uppercase tracking-[0.4em] ${typeColor}`}>
          {typeLabel}
        </span>
        <button 
          onClick={() => onRemove(toast.id)} 
          className="text-text-tertiary hover:text-text-primary text-[10px] tracking-widest leading-none outline-none"
        >
          FECHAR
        </button>
      </div>
      <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest leading-relaxed mt-1">
        {toast.message}
      </p>
      
      <div className="mt-4 h-[1px] bg-border-light dark:bg-border-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-primary animate-toastTimer origin-left" />
      </div>
    </div>
  )
}