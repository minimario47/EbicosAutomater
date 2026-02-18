import type { AutomationMode } from '../types/workbench'

interface InputPanelProps {
  mode: AutomationMode
  sourceCode: string
  intent: string
  notes: string
  apiKey: string
  model: string
  isRunning: boolean
  onSourceCodeChange: (value: string) => void
  onIntentChange: (value: string) => void
  onNotesChange: (value: string) => void
  onApiKeyChange: (value: string) => void
  onModelChange: (value: string) => void
  onRun: () => void
}

const modeTitle: Record<AutomationMode, string> = {
  create: 'NEW',
  edit: 'PATCH',
  debug: 'TRACE',
}

const modePlaceholder: Record<AutomationMode, string> = {
  create: 'START 327\n...\nSLUT',
  edit: 'Paste existing automation',
  debug: 'Paste failing automation',
}

export function InputPanel({
  mode,
  sourceCode,
  intent,
  notes,
  apiKey,
  model,
  isRunning,
  onSourceCodeChange,
  onIntentChange,
  onNotesChange,
  onApiKeyChange,
  onModelChange,
  onRun,
}: InputPanelProps) {
  return (
    <section className="input-panel" aria-label="Input">
      <div className="panel-head">
        <h2>{modeTitle[mode]}</h2>
        <button type="button" className="run-button" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'RUNNING' : 'RUN'}
        </button>
      </div>

      <label className="field-label" htmlFor="source-code">
        CODE
      </label>
      <textarea
        id="source-code"
        className="code-input"
        value={sourceCode}
        onChange={(event) => onSourceCodeChange(event.target.value)}
        placeholder={modePlaceholder[mode]}
        spellCheck={false}
      />

      <label className="field-label" htmlFor="intent-text">
        INTENT
      </label>
      <textarea
        id="intent-text"
        className="intent-input"
        value={intent}
        onChange={(event) => onIntentChange(event.target.value)}
        placeholder="ATB 327 with safe stop condition"
        spellCheck={false}
      />

      <label className="field-label" htmlFor="notes-text">
        NOTES
      </label>
      <input
        id="notes-text"
        className="single-input"
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Optional operator context"
      />

      <div className="credential-grid">
        <div>
          <label className="field-label" htmlFor="model-name">
            MODEL
          </label>
          <input
            id="model-name"
            className="single-input"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            placeholder="gpt-5.3-codex"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="api-key">
            KEY
          </label>
          <input
            id="api-key"
            className="single-input"
            type="password"
            value={apiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
        </div>
      </div>
    </section>
  )
}
