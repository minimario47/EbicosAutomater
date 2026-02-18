const KNOWLEDGE_SOURCES = [
  {
    id: 'AUTOMATER7',
    path: '/knowledge/Automater7.txt',
  },
  {
    id: 'KORPLAN8',
    path: '/knowledge/Korplan8.txt',
  },
] as const

interface KnowledgeChunk {
  sourceId: string
  id: number
  text: string
  terms: string[]
}

interface MandatorySnippet {
  key: string
  text: string
  terms: string[]
}

interface LoadedSource {
  sourceId: string
  text: string
}

let chunksCache: KnowledgeChunk[] | null = null
let mandatoryCache: MandatorySnippet[] | null = null

export async function ensureEbicosKnowledge(): Promise<void> {
  await loadChunks()
}

export async function retrieveEbicosContext(query: string, maxChunks = 8): Promise<string[]> {
  const chunks = await loadChunks()
  const mandatory = pickMandatorySnippets(query)
  const terms = normalize(query)

  if (!terms.length) {
    return [...mandatory.map((item) => item.text), ...chunks.slice(0, maxChunks).map((chunk) => chunk.text)]
  }

  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: overlapScore(terms, chunk.terms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks + mandatory.length * 2)

  if (!ranked.length) {
    return [...mandatory.map((item) => item.text), ...chunks.slice(0, maxChunks).map((chunk) => chunk.text)]
  }

  const selected = mandatory.map((item) => item.text)
  const seen = new Set(selected)

  for (const item of ranked) {
    if (seen.has(item.chunk.text)) {
      continue
    }
    selected.push(item.chunk.text)
    seen.add(item.chunk.text)
    if (selected.length >= maxChunks + mandatory.length) {
      break
    }
  }

  return selected
}

async function loadChunks(): Promise<KnowledgeChunk[]> {
  if (chunksCache) {
    return chunksCache
  }

  const loadedSources = await Promise.all(
    KNOWLEDGE_SOURCES.map(async (source) => {
      const response = await fetch(source.path)
      if (!response.ok) {
        throw new Error(`Kunde inte läsa EBICOS-referensen: ${source.path}`)
      }
      return {
        sourceId: source.id,
        text: cleanSource(await response.text()),
      }
    }),
  )

  mandatoryCache = buildMandatorySnippets(loadedSources)
  chunksCache = loadedSources.flatMap((source) => chunkText(source.text, source.sourceId))
  return chunksCache
}

function chunkText(source: string, sourceId: string): KnowledgeChunk[] {
  const lines = source
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^\d{4}-\d{2}-\d{2}/.test(line) && !line.startsWith('©'))

  const chunks: KnowledgeChunk[] = []
  let current = ''
  let id = 1

  for (const line of lines) {
    const isHeading = /^\d+(\.\d+)*\s/.test(line) || line === line.toUpperCase()

    if (isHeading && current.length > 0) {
      chunks.push({
        sourceId,
        id,
        text: `[${sourceId}] ${shrinkChunk(current)}`,
        terms: normalize(current),
      })
      id += 1
      current = ''
    }

    const next = `${current}\n${line}`.trim()
    if (next.length > 1200) {
      chunks.push({
        sourceId,
        id,
        text: `[${sourceId}] ${shrinkChunk(current)}`,
        terms: normalize(current),
      })
      id += 1
      current = line
    } else {
      current = next
    }
  }

  if (current) {
    chunks.push({
      sourceId,
      id,
      text: `[${sourceId}] ${shrinkChunk(current)}`,
      terms: normalize(current),
    })
  }

  return chunks.filter((chunk) => chunk.text.length > 40)
}

function pickMandatorySnippets(query: string): MandatorySnippet[] {
  const all = mandatoryCache ?? []
  if (!all.length) {
    return []
  }
  void query
  return all
}

function buildMandatorySnippets(sources: LoadedSource[]): MandatorySnippet[] {
  const snippets: MandatorySnippet[] = []

  const automater = sources.find((source) => source.sourceId === 'AUTOMATER7')?.text
  const korplan = sources.find((source) => source.sourceId === 'KORPLAN8')?.text

  if (automater) {
    pushMandatory(snippets, 'AUTOMATER7-7.6', extractBetween(automater, /7\.6\s+Automatinnehåll/i, /7\.7\s+Exekvering/i))
    pushMandatory(snippets, 'AUTOMATER7-7.9', extractBetween(automater, /7\.9\s+Sammanställning av kommandon/i, /8\.\s+Körplaner/i))
  }

  if (korplan) {
    pushMandatory(
      snippets,
      'KORPLAN8-8.3',
      extractBetween(korplan, /8\.3\s+Körplanens uppbyggnad och struktur/i, /8\.4\s+Process för arbete med körplaner/i),
    )
    pushMandatory(snippets, 'KORPLAN8-8.14', extractBetween(korplan, /8\.14\s+Sammanställning av kommandon/i))
  }

  return snippets
}

function pushMandatory(target: MandatorySnippet[], key: string, rawText: string): void {
  const text = clampText(rawText, 4200)
  if (!text) {
    return
  }

  target.push({
    key,
    text: `[${key}] ${text}`,
    terms: normalize(text),
  })
}

function extractBetween(source: string, startPattern: RegExp, endPattern?: RegExp): string {
  const startMatch = startPattern.exec(source)
  if (!startMatch || startMatch.index < 0) {
    return ''
  }

  const start = startMatch.index
  const tail = source.slice(start)

  if (!endPattern) {
    return shrinkChunk(tail)
  }

  const endMatch = endPattern.exec(tail)
  if (!endMatch || endMatch.index < 0) {
    return shrinkChunk(tail)
  }

  const end = endMatch.index
  return shrinkChunk(tail.slice(0, end))
}

function clampText(text: string, maxChars: number): string {
  if (!text) {
    return ''
  }
  if (text.length <= maxChars) {
    return text
  }
  return `${text.slice(0, maxChars)} ...`
}

function cleanSource(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/Dokumentet är elektroniskt undertecknat/gi, '')
    .replace(/strictly prohibited\./gi, '')
}

function shrinkChunk(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9åäö_:\-\s]/gi, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2)
}

function overlapScore(queryTerms: string[], chunkTerms: string[]): number {
  const set = new Set(chunkTerms)
  let score = 0
  for (const term of queryTerms) {
    if (set.has(term)) {
      score += term.length
    }
  }
  return score
}
