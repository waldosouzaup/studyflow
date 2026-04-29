export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <span className="text-xs font-label text-[var(--text-muted)] uppercase tracking-wider">Carregando...</span>
      </div>
    </div>
  )
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="card p-6 text-center max-w-sm border-l-2 border-l-danger">
        <span className="material-symbols-outlined text-danger text-3xl mb-3 block">error_outline</span>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-ghost px-4 py-2 text-xs"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}