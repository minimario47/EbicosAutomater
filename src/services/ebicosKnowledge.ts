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

let chunksCache: KnowledgeChunk[] | null = null

export async function ensureEbicosKnowledge(): Promise<void> {
  await loadChunks()
}

export async function retrieveEbicosContext(query: string, maxChunks = 8): Promise<string[]> {
  const chunks = await loadChunks()
  const terms = normalize(query)

  if (!terms.length) {
    return chunks.slice(0, maxChunks).map((chunk) => chunk.text)
  }

  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: overlapScore(terms, chunk.terms),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)

  if (!ranked.length) {
    return chunks.slice(0, maxChunks).map((chunk) => chunk.text)
  }

  return ranked.map((item) => item.chunk.text)
}

async function loadChunks(): Promise<KnowledgeChunk[]> {
  if (chunksCache) {
    return chunksCache
  }

  const loaded = await Promise.all(
    KNOWLEDGE_SOURCES.map(async (source) => {
      const response = await fetch(source.path)
      if (!response.ok) {
        throw new Error(`Kunde inte läsa EBICOS-referensen: ${source.path}`)
      }
      return {
        sourceId: source.id,
        text: await response.text(),
      }
    }),
  )

  chunksCache = loaded.flatMap((source) => chunkText(source.text, source.sourceId))
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
