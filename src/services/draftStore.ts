import { type AutomationMode, type WorkbenchDraft } from '../types/workbench'

const DRAFT_KEY = 'ebicos_workbench_draft_v1'

const EMPTY_DRAFT: WorkbenchDraft = {
  mode: 'create',
  sourceCode: '',
  intent: '',
  notes: '',
  updatedAt: new Date(0).toISOString(),
}

export function loadDraft(): WorkbenchDraft {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) {
    return EMPTY_DRAFT
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WorkbenchDraft>
    return {
      mode: parseMode(parsed.mode),
      sourceCode: parsed.sourceCode ?? '',
      intent: parsed.intent ?? '',
      notes: parsed.notes ?? '',
      updatedAt: parsed.updatedAt ?? EMPTY_DRAFT.updatedAt,
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export function saveDraft(draft: Omit<WorkbenchDraft, 'updatedAt'>): WorkbenchDraft {
  const next = {
    ...draft,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  return next
}

function parseMode(mode: unknown): AutomationMode {
  if (mode === 'create' || mode === 'edit' || mode === 'debug') {
    return mode
  }

  return 'create'
}
