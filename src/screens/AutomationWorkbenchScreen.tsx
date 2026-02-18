import { InputPanel } from '../components/InputPanel'
import { ModeRail } from '../components/ModeRail'
import { ResultPanel } from '../components/ResultPanel'
import { StatusStrip } from '../components/StatusStrip'
import { WorkbenchHeader } from '../components/WorkbenchHeader'
import { useAutomationWorkbench } from '../flows/useAutomationWorkbench'

export function AutomationWorkbenchScreen() {
  const {
    state,
    setMode,
    setSourceCode,
    setIntent,
    setNotes,
    setApiKey,
    setModel,
    run,
  } = useAutomationWorkbench()

  return (
    <main className="workbench-shell">
      <WorkbenchHeader knowledgeReady={state.knowledgeReady} />

      <section className="workbench-frame">
        <ModeRail mode={state.mode} onModeChange={setMode} />

        <div className="workbench-content">
          <StatusStrip issues={state.issues} error={state.error} lastSavedAt={state.lastSavedAt} />

          <div className="workbench-columns">
            <InputPanel
              mode={state.mode}
              sourceCode={state.sourceCode}
              intent={state.intent}
              notes={state.notes}
              apiKey={state.apiKey}
              model={state.model}
              isRunning={state.isRunning}
              onSourceCodeChange={setSourceCode}
              onIntentChange={setIntent}
              onNotesChange={setNotes}
              onApiKeyChange={setApiKey}
              onModelChange={setModel}
              onRun={run}
            />

            <ResultPanel
              mode={state.mode}
              intent={state.intent}
              sourceCode={state.sourceCode}
              result={state.result}
              issues={state.issues}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
