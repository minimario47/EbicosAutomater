import { type ValidationIssue } from '../types/workbench'

const ACTION_COMMANDS = new Set([
  'START',
  'INTIME',
  'INTRSIG',
  'DESSIG',
  'TRINF',
  'RPS',
  'SIG',
  'STN',
  'DGN',
  'HTR',
  'KVR',
  'ALT',
  'NRM',
  'TBN',
  'TDN',
  'TRN',
  'TVN',
  'STO',
  'SLUT',
  'ATI',
  'ATR',
  'ATE',
  'ASV',
  'ADL',
  'ANO',
  'AOK',
  'KLF',
  'TRH',
  'TRF',
  'VRK',
  'UTL',
  'SIS',
  'SIL',
  'SIU',
  'PSS',
  'SAT',
  'SAU',
  'VXH',
  'VXV',
  'VXL',
  'VXC',
  'VXS',
  'VXF',
  'VFT',
  'VST',
  'VSF',
  'VSL',
  'VSC',
  'VFF',
  'ASS',
  'ASN',
  'LAT',
  'LAU',
  'LOT',
  'LOU',
  'VVH',
  'VVU',
  'VVQ',
  'VVD',
  'VVT',
  'VVF',
  'RES',
  'NOR',
  'ABC',
  'LEA',
  'LEB',
  'TOT',
  'PAR',
  'TLS',
  'TLF',
  'BTV',
  'TNB',
  'TNR',
  'TNV',
  'TND',
  'TNX',
  'ATN',
  'HOP',
])

const LOGIC_COMMANDS = new Set(['OMM', 'FAL', 'VAN', 'NAR', 'ELR', 'UTF', 'ANS', 'DAA', 'SLT'])

const PREFIX_COMMANDS = new Set([
  'START',
  'SIG',
  'STN',
  'DGN',
  'HTR',
  'KVR',
  'ALT',
  'TBN',
  'TDN',
  'BTK',
  'VKP',
  'RAK',
  'TLS',
  'TLF',
  'TSF',
  'TSS',
  'BTV',
  'TOP',
  'NSI',
])

const CONDITION_COMMANDS = new Set([
  'QST',
  'QMI',
  'QEQ',
  'QNT',
  'QAV',
  'QAE',
  'QAT',
  'QRT',
  'QDA',
  'QTB',
  'QTE',
  'QTS',
  'QTT',
  'QMB',
  'QEM',
  'QMS',
  'QME',
  'QSK',
  'QSS',
  'QSH',
  'QSE',
  'QSA',
  'QSM',
  'QLB',
  'QLF',
  'QLI',
  'QLU',
  'QLL',
  'QLO',
  'QLN',
  'QLS',
  'QSB',
  'QSF',
  'QSP',
  'QES',
  'QVH',
  'QVV',
  'QVL',
  'QVE',
  'QDN',
  'EXT',
  'EXF',
  'EXN',
  'EXM',
  'EXP',
  'EXH',
  'EXL',
  'VTN',
  'VTS',
  'VTM',
  'VTL',
  'VTP',
])

type LogicHead = 'OMM' | 'FAL' | 'VAN' | 'NAR'

interface LogicState {
  type: LogicHead
  startLine: number
  utfCount: number
  daaCount: number
}

interface ValidationOptions {
  allowEmpty?: boolean
}

export function validateAutomation(sourceCode: string, options: ValidationOptions = {}): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const lines = sourceCode.replace(/\r/g, '').split('\n')
  let firstCodeLine = 0
  let lastCodeLine = 0
  let logic: LogicState | null = null

  lines.forEach((originalLine, index) => {
    const lineNumber = index + 1
    const clean = stripComment(originalLine)
    if (!clean) {
      return
    }

    if (!firstCodeLine) {
      firstCodeLine = lineNumber
    }
    lastCodeLine = lineNumber

    const token = firstToken(clean)

    if (!token) {
      return
    }

    if (token.length > 16) {
      issues.push({
        level: 'warning',
        line: lineNumber,
        message: 'Ovanligt långt kommandonamn. Kontrollera syntax.',
        evidence: 'Kap. 7.9 kommandolistor',
      })
    }

    if (token === 'OMM' || token === 'FAL' || token === 'VAN' || token === 'NAR') {
      if (logic) {
        issues.push({
          level: 'error',
          line: lineNumber,
          message: 'Nästlad logisk sats upptäckt.',
          evidence: 'Kap. 7.6.2: logiska satser får ej nästlas',
        })
      } else {
        logic = {
          type: token,
          startLine: lineNumber,
          utfCount: 0,
          daaCount: 0,
        }
      }
    }

    if (token === 'SLT') {
      if (!logic) {
        issues.push({
          level: 'warning',
          line: lineNumber,
          message: 'SLT saknar aktiv logisk huvudpost.',
          evidence: 'Kap. 7.6.2',
        })
      } else {
        finalizeLogicBlock(logic, issues, lineNumber)
        logic = null
      }
    }

    if (logic) {
      if (token === 'DAA') {
        logic.daaCount += 1
      }
      if (token === 'UTF') {
        logic.utfCount += 1
      }
      if (token === 'NAR' && logic.type !== 'NAR') {
        issues.push({
          level: 'error',
          line: lineNumber,
          message: 'NAR inuti annan sats är inte tillåtet.',
          evidence: 'Kap. 7.6.2',
        })
      }
    }

    if (token === 'ATN' || token === 'HOP') {
      const label = clean.split(/\s+/)[1] ?? ''
      if (label.length !== 5 || !/^[A-Z0-9]{5}$/.test(label)) {
        issues.push({
          level: 'error',
          line: lineNumber,
          message: `${token} kräver lägesnamn med exakt 5 tecken (A-Z, 0-9).`,
          evidence: 'Kap. 7.9.6',
        })
      }
    }

    if (token === 'START') {
      const name = clean.split(/\s+/)[1] ?? ''
      if (!name) {
        issues.push({
          level: 'error',
          line: lineNumber,
          message: 'START saknar automatnamn.',
          evidence: 'Kap. 7.4.3',
        })
      }
      if (name.length > 6) {
        issues.push({
          level: 'warning',
          line: lineNumber,
          message: 'Automatnamn bör vara högst 6 tecken.',
          evidence: 'Kap. 7.4.3',
        })
      }
    }

    if (token.startsWith('START_')) {
      const name = token.slice('START_'.length)
      if (!name) {
        issues.push({
          level: 'error',
          line: lineNumber,
          message: 'START_ saknar identitet.',
          evidence: 'Kap. 8.3.2.1',
        })
      }
    }

    if (!isKnownToken(token) && !isExpressionLine(clean)) {
      issues.push({
        level: 'warning',
        line: lineNumber,
        message: `Okänd sats: ${token}`,
        evidence: 'Kap. 7.9.2-7.9.7',
      })
    }

    if (clean.length > 120) {
      issues.push({
        level: 'info',
        line: lineNumber,
        message: 'Lång rad kan vara svår att felsöka under drift.',
      })
    }
  })

  if (!firstCodeLine) {
    if (options.allowEmpty) {
      return issues
    }

    issues.push({
      level: 'error',
      message: 'Tom automationsfil.',
      evidence: 'Kap. 7.4',
    })
    return issues
  }

  const firstLine = stripComment(lines[firstCodeLine - 1])
  const lastLine = stripComment(lines[lastCodeLine - 1])

  if (!firstLine.startsWith('START')) {
    issues.push({
      level: 'error',
      line: firstCodeLine,
      message: 'Första raden bör vara START <automat>.',
      evidence: 'Kap. 7.4.4 exempel',
    })
  }

  if (!lastLine.startsWith('SLUT')) {
    issues.push({
      level: 'error',
      line: lastCodeLine,
      message: 'Sista raden bör vara SLUT.',
      evidence: 'Kap. 7.4.4 exempel',
    })
  }

  const pendingLogic = logic as LogicState | null

  if (pendingLogic) {
    issues.push({
      level: 'error',
      line: pendingLogic.startLine,
      message: `Logisk sats ${pendingLogic.type} saknar SLT.`,
      evidence: 'Kap. 7.6.2',
    })
  }

  return issues
}

function finalizeLogicBlock(state: LogicState, issues: ValidationIssue[], line: number): void {
  if (state.type === 'OMM' && state.utfCount < 1) {
    issues.push({
      level: 'error',
      line,
      message: 'OMM-sats saknar UTF-del.',
      evidence: 'Kap. 7.6.2.1',
    })
  }

  if (state.type === 'FAL') {
    if (state.daaCount < 1 || state.utfCount < 1 || state.daaCount !== state.utfCount) {
      issues.push({
        level: 'error',
        line,
        message: 'FAL kräver matchande DAA/UTF-par.',
        evidence: 'Kap. 7.6.2.2',
      })
    }
  }

  if (state.type === 'NAR') {
    if (state.daaCount < 1 || state.utfCount < 1 || state.daaCount !== state.utfCount) {
      issues.push({
        level: 'error',
        line,
        message: 'NAR kräver matchande DAA/UTF-par.',
        evidence: 'Kap. 7.6.2.4',
      })
    }
    if (state.daaCount > 2 || state.utfCount > 2) {
      issues.push({
        level: 'error',
        line,
        message: 'NAR får innehålla högst två DAA/UTF-par.',
        evidence: 'Felmeddelande: FÖR MÅNGA DAA-UTF',
      })
    }
  }
}

function stripComment(line: string): string {
  return line.split('--')[0].trim()
}

function firstToken(line: string): string {
  return line.split(/\s+/)[0]?.toUpperCase() ?? ''
}

function isKnownToken(token: string): boolean {
  if (isPrefixToken(token)) {
    return true
  }
  return ACTION_COMMANDS.has(token) || LOGIC_COMMANDS.has(token) || CONDITION_COMMANDS.has(token)
}

function isPrefixToken(token: string): boolean {
  const split = token.split('_')
  if (!split.length || split.length === 1) {
    return false
  }

  const prefix = split[0]
  return PREFIX_COMMANDS.has(prefix)
}

function isExpressionLine(line: string): boolean {
  if (/^[()!&|^\s]+$/.test(line)) {
    return true
  }

  const token = firstToken(line)
  return token.startsWith('(') || token.startsWith('!(')
}
