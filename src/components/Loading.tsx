export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin`} />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
      <p className="font-medium">Erro</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  )
}