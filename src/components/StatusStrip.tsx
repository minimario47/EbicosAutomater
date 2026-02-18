import type { ValidationIssue } from '../types/workbench'

interface StatusStripProps {
  issues: ValidationIssue[]
  error: string
  lastSavedAt: string
}

export function StatusStrip({ issues, error, lastSavedAt }: StatusStripProps) {
  const errorCount = issues.filter((issue) => issue.level === 'error').length
  const warningCount = issues.filter((issue) => issue.level === 'warning').length

  return (
    <section className="status-strip" aria-live="polite">
      <div>
        <span className="status-label">CHECK</span>
        <span>{errorCount}E / {warningCount}W</span>
      </div>
      <div>
        <span className="status-label">SAVE</span>
        <span>{formatTime(lastSavedAt)}</span>
      </div>
      <div className="status-wide">
        <span className="status-label">STATE</span>
        <span>{error ? error : issues[0]?.message ?? 'READY'}</span>
      </div>
    </section>
  )
}

function formatTime(value: string): string {
  if (!value || value.startsWith('1970-')) {
    return 'NEW'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'NEW'
  }

  return date.toLocaleString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}
