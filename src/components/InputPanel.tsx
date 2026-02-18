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
  create: 'SKAPA',
  edit: 'REDIGERA',
  debug: 'FELSÖK',
}

const modePlaceholder: Record<AutomationMode, string> = {
  create: 'START 327\n...\nSLUT',
  edit: 'Klistra in befintlig automat',
  debug: 'Klistra in automat med fel',
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
    <section className="input-panel" aria-label="Inmatning">
      <div className="panel-head">
        <h2>{modeTitle[mode]}</h2>
        <button type="button" className="run-button" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'KÖR...' : 'KÖR'}
        </button>
      </div>

      <label className="field-label" htmlFor="source-code">
        KOD
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
        AVSIKT
      </label>
      <textarea
        id="intent-text"
        className="intent-input"
        value={intent}
        onChange={(event) => onIntentChange(event.target.value)}
        placeholder="ATB 327 med säker stoppsekvens"
        spellCheck={false}
      />

      <label className="field-label" htmlFor="notes-text">
        NOTERING
      </label>
      <input
        id="notes-text"
        className="single-input"
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder="Valfri operatörskontext"
      />

      <div className="credential-grid">
        <div>
          <label className="field-label" htmlFor="model-name">
            MODELL
          </label>
          <input
            id="model-name"
            className="single-input"
            value={model}
            onChange={(event) => onModelChange(event.target.value)}
            placeholder="gpt-5.2-codex"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="api-key">
            NYCKEL
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
