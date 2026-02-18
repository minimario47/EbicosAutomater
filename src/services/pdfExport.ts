import jsPDF from 'jspdf'
import type { AiResult, AutomationMode, ValidationIssue } from '../types/workbench'

interface ExportInput {
  mode: AutomationMode
  intent: string
  sourceCode: string
  result: AiResult | null
  issues: ValidationIssue[]
}

export function downloadResultPdf(input: ExportInput): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = doc.internal.pageSize.getWidth() - 80
  const marginX = 40
  const marginY = 42
  let cursorY = marginY

  const writeLine = (text: string, size = 11) => {
    doc.setFont('courier', 'normal')
    doc.setFontSize(size)
    const wrapped = doc.splitTextToSize(text || '-', maxWidth)

    for (const line of wrapped) {
      if (cursorY > pageHeight - marginY) {
        doc.addPage()
        cursorY = marginY
      }
      doc.text(line, marginX, cursorY)
      cursorY += size + 4
    }
  }

  const writeSection = (title: string, lines: string[]) => {
    if (cursorY > pageHeight - marginY - 30) {
      doc.addPage()
      cursorY = marginY
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(title, marginX, cursorY)
    cursorY += 16

    for (const line of lines) {
      writeLine(line)
    }

    cursorY += 8
  }

  const risks = input.result?.risks?.length ? input.result.risks : input.issues.map((issue) => issue.message)

  writeSection('EBICOS AUTOMATER RESULTAT', [
    `Tid: ${new Date().toLocaleString('sv-SE')}`,
    `Läge: ${modeLabel(input.mode)}`,
  ])

  writeSection('AVSIKT', [input.intent || 'Saknas'])
  writeSection('INMATAD KOD', [input.sourceCode || 'Saknas'])
  writeSection('GENERERAD KOD', [input.result?.code || 'Ingen utdata'])
  writeSection('RISKER', risks.length ? risks : ['Inga risker'])
  writeSection('NOTERINGAR', input.result?.notes?.length ? input.result.notes : ['Inga noteringar'])
  writeSection(
    'KÄLLSTÖD',
    input.result?.evidence?.length ? input.result.evidence : ['Ingen evidens returnerad från modellen'],
  )

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  doc.save(`ebicos-resultat-${stamp}.pdf`)
}

function modeLabel(mode: AutomationMode): string {
  if (mode === 'create') {
    return 'Skapa'
  }
  if (mode === 'edit') {
    return 'Redigera'
  }
  return 'Felsök'
}
