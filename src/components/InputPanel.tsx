import type { AutomationMode } from '../types/workbench'

interface InputPanelProps {
  mode: AutomationMode
  sourceCode: string
  intent: string
  notes: string
  isRunning: boolean
  onSourceCodeChange: (value: string) => void
  onIntentChange: (value: string) => void
  onNotesChange: (value: string) => void
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
  isRunning,
  onSourceCodeChange,
  onIntentChange,
  onNotesChange,
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
      <p className="field-hint">Klistra in EBICOS-kod eller lämna tom vid ny skapning.</p>

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
      <p className="field-hint">Beskriv kort vad automaten ska göra.</p>

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
      <p className="field-hint">Valfri kontext: station, objekt, begränsningar.</p>
    </section>
  )
}
