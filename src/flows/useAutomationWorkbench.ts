import { useEffect, useMemo, useState } from 'react'
import { ensureEbicosKnowledge, retrieveEbicosContext } from '../services/ebicosKnowledge'
import { validateAutomation } from '../services/automationValidator'
import { loadDraft, saveDraft } from '../services/draftStore'
import { runEbicosAssistant } from '../services/openaiClient'
import type { AiResult, AutomationMode, RunRequest, ValidationIssue } from '../types/workbench'

interface WorkbenchState {
  mode: AutomationMode
  sourceCode: string
  intent: string
  notes: string
  result: AiResult | null
  issues: ValidationIssue[]
  isRunning: boolean
  error: string
  lastSavedAt: string
  knowledgeReady: boolean
}

export function useAutomationWorkbench() {
  const draft = useMemo(() => loadDraft(), [])

  const [state, setState] = useState<WorkbenchState>({
    mode: draft.mode,
    sourceCode: draft.sourceCode,
    intent: draft.intent,
    notes: draft.notes,
    result: null,
    issues: computeIssues(draft.mode, draft.sourceCode),
    isRunning: false,
    error: '',
    lastSavedAt: draft.updatedAt,
    knowledgeReady: false,
  })

  useEffect(() => {
    ensureEbicosKnowledge()
      .then(() => {
        setState((current) => ({ ...current, knowledgeReady: true }))
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Kunde inte ladda EBICOS-referens.'
        setState((current) => ({ ...current, error: message }))
      })
  }, [])

  useEffect(() => {
    saveDraft({
      mode: state.mode,
      sourceCode: state.sourceCode,
      intent: state.intent,
      notes: state.notes,
    })
  }, [state.mode, state.sourceCode, state.intent, state.notes])

  const setMode = (mode: AutomationMode) => {
    setState((current) => ({
      ...current,
      mode,
      issues: computeIssues(mode, current.sourceCode),
      lastSavedAt: nowStamp(),
    }))
  }

  const setSourceCode = (sourceCode: string) => {
    setState((current) => ({
      ...current,
      sourceCode,
      issues: computeIssues(current.mode, sourceCode),
      lastSavedAt: nowStamp(),
    }))
  }

  const setIntent = (intent: string) => {
    setState((current) => ({ ...current, intent, lastSavedAt: nowStamp() }))
  }

  const setNotes = (notes: string) => {
    setState((current) => ({ ...current, notes, lastSavedAt: nowStamp() }))
  }

  const clearResult = () => {
    setState((current) => ({ ...current, result: null, error: '' }))
  }

  const run = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim() ?? ''
    if (!apiKey) {
      setState((current) => ({ ...current, error: 'API-nyckel saknas i miljön (VITE_OPENAI_API_KEY).' }))
      return
    }

    if (!state.sourceCode.trim() && !state.intent.trim()) {
      setState((current) => ({ ...current, error: 'Fyll i avsikt eller kod innan körning.' }))
      return
    }

    const issues = computeIssues(state.mode, state.sourceCode)

    setState((current) => ({
      ...current,
      isRunning: true,
      issues,
      error: '',
    }))

    try {
      const seed = state.mode === 'create' ? '7.4 7.6 7.7 7.9 START SLUT OMM FAL VAN NAR ATN HOP ATI ATB ATA' : ''
      const context = await retrieveEbicosContext(
        `${state.mode} ${seed} ${state.intent} ${state.sourceCode} ${state.notes} ${issues.map((issue) => issue.message).join(' ')}`,
      )

      const request: RunRequest = {
        apiKey,
        mode: state.mode,
        sourceCode: state.sourceCode,
        intent: state.intent,
        notes: state.notes,
      }

      const result = await runEbicosAssistant(request, issues, context)

      setState((current) => ({
        ...current,
        result,
        isRunning: false,
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Okänt fel vid AI-körning.'
      setState((current) => ({
        ...current,
        isRunning: false,
        error: message,
      }))
    }
  }

  return {
    state,
    setMode,
    setSourceCode,
    setIntent,
    setNotes,
    clearResult,
    run,
  }
}

function nowStamp(): string {
  return new Date().toISOString()
}

function computeIssues(mode: AutomationMode, sourceCode: string): ValidationIssue[] {
  const allowEmpty = mode === 'create' && sourceCode.trim().length === 0
  return validateAutomation(sourceCode, { allowEmpty })
}
