import { useState } from 'react'
import { downloadResultPdf } from '../services/pdfExport'
import type { AiResult, AutomationMode, ValidationIssue } from '../types/workbench'

interface ResultPanelProps {
  mode: AutomationMode
  intent: string
  sourceCode: string
  result: AiResult | null
  issues: ValidationIssue[]
}

export function ResultPanel({ mode, intent, sourceCode, result, issues }: ResultPanelProps) {
  const [copyState, setCopyState] = useState('KOPIERA')

  const handleCopy = async () => {
    if (!result?.code) {
      return
    }

    try {
      await navigator.clipboard.writeText(result.code)
      setCopyState('KOPIERAD')
      setTimeout(() => setCopyState('KOPIERA'), 1200)
    } catch {
      setCopyState('LÅST')
      setTimeout(() => setCopyState('KOPIERA'), 1200)
    }
  }

  const handleExportPdf = () => {
    downloadResultPdf({
      mode,
      intent,
      sourceCode,
      result,
      issues,
    })
  }

  return (
    <section className="result-panel" aria-label="Resultat">
      <div className="panel-head">
        <h2>RESULTAT</h2>
        <div className="panel-actions">
          <button type="button" className="ghost-button" onClick={handleExportPdf}>
            LADDA PDF
          </button>
          <button type="button" className="ghost-button" onClick={handleCopy}>
            {copyState}
          </button>
        </div>
      </div>

      <article className="result-block">
        <h3>KOD</h3>
        <pre>{result?.code || 'INGEN UTDATA ÄN'}</pre>
      </article>

      <article className="result-block">
        <h3>RISKER</h3>
        {renderList(result?.risks?.length ? result.risks : issues.map((issue) => issue.message), 'INGA RISKER')}
      </article>

      <article className="result-block">
        <h3>NOTERINGAR</h3>
        {renderList(result?.notes, 'INGA NOTERINGAR')}
      </article>

      <article className="result-block">
        <h3>KÄLLSTÖD</h3>
        {renderList(result?.evidence, 'KÄLLKONTEXT EJ LADAD')}
      </article>
    </section>
  )
}

function renderList(items: string[] | undefined, fallback: string) {
  if (!items?.length) {
    return <p>{fallback}</p>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  )
}
