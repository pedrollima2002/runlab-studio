import type { ActivitySourceFormat } from './activity-types.ts'

export const MAX_ACTIVITY_FILE_BYTES = 20 * 1024 * 1024
export const ACTIVITY_IMPORT_TIMEOUT_MS = 30_000

export class ActivityImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ActivityImportError'
  }
}

export function validateActivityFileMetadata(file: Pick<File, 'name' | 'size'>): ActivitySourceFormat {
  if (file.size === 0) throw new ActivityImportError('O arquivo está vazio. Escolha um FIT ou TCX com dados de uma atividade.')
  if (file.size > MAX_ACTIVITY_FILE_BYTES) throw new ActivityImportError('O arquivo excede o limite de 20 MB para processamento local.')
  const extension = file.name.trim().toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]
  if (extension !== 'fit' && extension !== 'tcx') throw new ActivityImportError('Formato não aceito. Escolha um arquivo com extensão .fit ou .tcx.')
  return extension
}
