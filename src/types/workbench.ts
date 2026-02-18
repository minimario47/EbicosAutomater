export type AutomationMode = 'create' | 'edit' | 'debug'

export type IssueLevel = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  level: IssueLevel
  message: string
  line?: number
  evidence?: string
}

export interface WorkbenchDraft {
  mode: AutomationMode
  sourceCode: string
  intent: string
  notes: string
  updatedAt: string
}

export interface AiResult {
  code: string
  risks: string[]
  notes: string[]
  evidence: string[]
  raw: string
}

export interface RunRequest {
  apiKey: string
  model: string
  mode: AutomationMode
  sourceCode: string
  intent: string
  notes: string
}
