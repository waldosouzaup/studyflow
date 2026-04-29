import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import manualContent from '../../MANUAL_USUARIO.md?raw'

export default function Manual() {
  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div>
        <span className="text-[10px] font-label uppercase tracking-[0.12em] text-[var(--text-muted)]">Ajuda</span>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">
          Manual do Usuário
        </h1>
      </div>

      <div className="card p-6 lg:p-10 bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none 
          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight 
          prose-h1:text-[var(--text-primary)] prose-h2:text-[var(--text-primary)] prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[var(--border)]
          prose-h3:text-[var(--text-secondary)]
          prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[var(--text-primary)] prose-strong:font-semibold
          prose-ul:text-[var(--text-secondary)] prose-ol:text-[var(--text-secondary)]
          prose-li:marker:text-[var(--text-muted)]
          prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-[var(--bg-subtle)] prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-[var(--text-primary)] prose-blockquote:not-italic
          prose-hr:border-[var(--border)]
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {manualContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
