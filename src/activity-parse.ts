import { parseFitActivity } from './activity-fit.ts'
import { parseTcxActivity } from './activity-tcx.ts'
import { ActivityImportError } from './activity-import-policy.ts'
import type { ActivitySourceFormat, NormalizedActivity } from './activity-types.ts'

function hasFitSignature(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 12) return false
  const bytes = new Uint8Array(buffer)
  const headerSize = bytes[0]
  return (headerSize === 12 || headerSize === 14) && String.fromCharCode(...bytes.slice(8, 12)) === '.FIT'
}

function decodeTcx(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    throw new ActivityImportError('O arquivo TCX não contém texto UTF-8 válido.')
  }
}

export async function parseActivityBuffer(format: ActivitySourceFormat, buffer: ArrayBuffer, fileName: string): Promise<NormalizedActivity> {
  if (format === 'fit') {
    if (!hasFitSignature(buffer)) throw new ActivityImportError('O conteúdo não possui uma assinatura FIT válida.')
    return parseFitActivity(buffer, fileName)
  }
  const xml = decodeTcx(buffer)
  if (!/<(?:\w+:)?TrainingCenterDatabase(?:\s|>)/i.test(xml)) {
    throw new ActivityImportError('O conteúdo não possui a estrutura de um arquivo TCX.')
  }
  return parseTcxActivity(xml, fileName)
}
