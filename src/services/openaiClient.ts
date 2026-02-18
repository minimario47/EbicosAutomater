import { type RunRequest, type AiResult, type ValidationIssue } from '../types/workbench'

interface OpenAiResponse {
  output_text?: string
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}

export async function runEbicosAssistant(
  request: RunRequest,
  validationIssues: ValidationIssue[],
  contextSnippets: string[],
): Promise<AiResult> {
  const systemPrompt = buildSystemPrompt(request.mode, contextSnippets)
  const userPrompt = buildUserPrompt(request, validationIssues)

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${request.apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userPrompt }],
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI-fel (${response.status}): ${body.slice(0, 240)}`)
  }

  const data = (await response.json()) as OpenAiResponse
  const text = extractText(data)

  if (!text) {
    throw new Error('Tomt svar från modellen.')
  }

  return parseAiResult(text)
}

function buildSystemPrompt(mode: string, snippets: string[]): string {
  const references = snippets
    .map((snippet, index) => `REFERENS ${index + 1}: ${snippet}`)
    .join('\n\n')

  return [
    'Du är en specialist på EBICOS 900 automater och körplaner.',
    'Primära källor är enbart Automater7.pdf (kapitel 7) och Korplan8.pdf (kapitel 8).',
    'Regel 1: Hitta inte på kommandon, syntax eller villkor som saknar stöd i referenserna.',
    'Regel 2: Om stöd saknas, skriv tydligt "osäkert" och föreslå säker verifiering i OPStation/AutoGen/TPGen.',
    'Regel 3: Svara alltid på svenska.',
    `Läge: ${modeLabel(mode)}`,
    'Returnera enbart giltig JSON med exakt detta schema:',
    '{"code":string,"risks":string[],"notes":string[],"evidence":string[]}',
    'code ska vara körbar kod när underlag räcker, annars minimal korrigerad version.',
    'risks ska vara drift- eller syntaxrisker kopplade till EBICOS-regler.',
    'notes ska vara korta operatörsnoteringar.',
    'evidence ska peka ut vilka referensbitar (AUTOMATER7/KORPLAN8) som användes.',
    references,
  ].join('\n')
}

function buildUserPrompt(request: RunRequest, validationIssues: ValidationIssue[]): string {
  const issuesText = validationIssues.length
    ? validationIssues
        .map((issue) => {
          const line = issue.line ? `rad ${issue.line}` : 'rad ?'
          return `${issue.level.toUpperCase()} ${line}: ${issue.message}`
        })
        .join('\n')
    : 'Inga lokala validatorfel.'

  return [
    `Uppgift: ${modeLabel(request.mode)}`,
    'Avsikt:',
    request.intent || '(saknas)',
    '',
    'Kod:',
    request.sourceCode || '(saknas)',
    '',
    'Operatörsnoteringar:',
    request.notes || '(saknas)',
    '',
    'Lokala kontroller:',
    issuesText,
  ].join('\n')
}

function modeLabel(mode: string): string {
  if (mode === 'create') {
    return 'Skapa'
  }
  if (mode === 'edit') {
    return 'Redigera'
  }
  return 'Felsök'
}

function extractText(response: OpenAiResponse): string {
  if (typeof response.output_text === 'string' && response.output_text.trim().length > 0) {
    return response.output_text.trim()
  }

  const collected: string[] = []
  for (const output of response.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === 'output_text' && content.text) {
        collected.push(content.text)
      }
    }
  }

  return collected.join('\n').trim()
}

function parseAiResult(text: string): AiResult {
  const jsonCandidate = tryExtractJson(text)
  if (!jsonCandidate) {
    return {
      code: '',
      risks: ['Svar kunde inte tolkas som JSON.'],
      notes: [],
      evidence: [],
      raw: text,
    }
  }

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<AiResult>
    return {
      code: typeof parsed.code === 'string' ? parsed.code.trim() : '',
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map(String) : [],
      raw: text,
    }
  } catch {
    return {
      code: '',
      risks: ['Svar kunde inte parse:as.'],
      notes: [],
      evidence: [],
      raw: text,
    }
  }
}

function tryExtractJson(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) {
    return trimmed.slice(first, last + 1)
  }

  return null
}
