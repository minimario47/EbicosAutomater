import { useState } from 'react'
import type { AiResult, ValidationIssue } from '../types/workbench'

interface ResultPanelProps {
  result: AiResult | null
  issues: ValidationIssue[]
}

export function ResultPanel({ result, issues }: ResultPanelProps) {
  const [copyState, setCopyState] = useState('COPY')

  const handleCopy = async () => {
    if (!result?.code) {
      return
    }

    try {
      await navigator.clipboard.writeText(result.code)
      setCopyState('COPIED')
      setTimeout(() => setCopyState('COPY'), 1200)
    } catch {
      setCopyState('LOCKED')
      setTimeout(() => setCopyState('COPY'), 1200)
    }
  }

  return (
    <section className="result-panel" aria-label="Result">
      <div className="panel-head">
        <h2>OUTPUT</h2>
        <button type="button" className="ghost-button" onClick={handleCopy}>
          {copyState}
        </button>
      </div>

      <article className="result-block">
        <h3>CODE</h3>
        <pre>{result?.code || 'NO OUTPUT YET'}</pre>
      </article>

      <article className="result-block">
        <h3>RISKS</h3>
        {renderList(result?.risks?.length ? result.risks : issues.map((issue) => issue.message), 'NO RISKS')}
      </article>

      <article className="result-block">
        <h3>NOTES</h3>
        {renderList(result?.notes, 'NO NOTES')}
      </article>

      <article className="result-block">
        <h3>EVIDENCE</h3>
        {renderList(result?.evidence, 'VL_TR_2020-0028 CONTEXT PENDING')}
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
