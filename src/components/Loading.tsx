export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-px',
    md: 'w-16 h-px',
    lg: 'w-24 h-px',
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className={`${sizeClasses[size]} bg-border-light dark:bg-border-dark relative overflow-hidden`}>
        <div className="absolute inset-0 bg-primary animate-loadingBar" />
      </div>
      <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-text-tertiary animate-pulse">Sincronizando...</span>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="border border-border-light dark:border-border-dark bg-surface-secondary/5 p-8 flex gap-6 items-start animate-scaleIn">
      <div className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest">Falha</div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary">Erro no Sistema</h4>
        <p className="text-[10px] font-mono text-text-secondary leading-relaxed max-w-md">{message}</p>
      </div>
    </div>
  )
}