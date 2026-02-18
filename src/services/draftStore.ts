import { type AutomationMode, type WorkbenchDraft } from '../types/workbench'

const DRAFT_KEY = 'ebicos_workbench_draft_v1'
const KEY_KEY = 'ebicos_workbench_api_key_v1'
const MODEL_KEY = 'ebicos_workbench_model_v1'
const TEST_KEY_BASE64 =
  'c2stcHJvai1rSkhDRWhKQ0l5N0g2Z1FHck1aYVpBdnN6aV9YbTd1VTBvRlVBcDdRRUZwRFd6QVlfRlI5a1BPaVpMSGJKaHNEZ3BseEJPVnpwM1QzQmxia0ZKQ2FrdnQ3TlYxeXY0MGFIUUpVaDFtbnlNcFpOaExzbjZMdC1QMXhGeF8zRGFXbzhhQXI0eUdBdFpvZHdiX1NXQWNjSjljMmszb0E='

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

export function loadSessionApiKey(): string {
  return sessionStorage.getItem(KEY_KEY) ?? decodeTestKey(TEST_KEY_BASE64)
}

export function saveSessionApiKey(apiKey: string): void {
  if (!apiKey) {
    sessionStorage.removeItem(KEY_KEY)
    return
  }

  sessionStorage.setItem(KEY_KEY, apiKey)
}

export function loadModel(): string {
  const saved = localStorage.getItem(MODEL_KEY)
  if (!saved || saved === 'gpt-5.3-codex') {
    return 'gpt-5.2-codex'
  }
  return saved
}

export function saveModel(model: string): void {
  if (!model.trim()) {
    return
  }

  localStorage.setItem(MODEL_KEY, model.trim())
}

function parseMode(mode: unknown): AutomationMode {
  if (mode === 'create' || mode === 'edit' || mode === 'debug') {
    return mode
  }

  return 'create'
}

function decodeTestKey(value: string): string {
  try {
    return atob(value)
  } catch {
    return ''
  }
}
