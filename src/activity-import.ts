import type { ActivitySourceFormat, NormalizedActivity } from './activity-types.ts'
import { ACTIVITY_IMPORT_TIMEOUT_MS, ActivityImportError, validateActivityFileMetadata } from './activity-import-policy.ts'

export { ACTIVITY_IMPORT_TIMEOUT_MS, ActivityImportError, MAX_ACTIVITY_FILE_BYTES, validateActivityFileMetadata } from './activity-import-policy.ts'

type WorkerResponse = { activity?: NormalizedActivity; error?: string }

function parseInWorker(format: ActivitySourceFormat, buffer: ArrayBuffer, fileName: string): Promise<NormalizedActivity> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./activity-import.worker.ts', import.meta.url), { type: 'module' })
    const timeout = window.setTimeout(() => {
      worker.terminate()
      reject(new ActivityImportError('O processamento excedeu 30 segundos e foi interrompido com segurança.'))
    }, ACTIVITY_IMPORT_TIMEOUT_MS)

    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      window.clearTimeout(timeout)
      worker.terminate()
      if (data.activity) resolve(data.activity)
      else reject(new ActivityImportError(data.error || 'Não foi possível interpretar o arquivo.'))
    }
    worker.onerror = () => {
      window.clearTimeout(timeout)
      worker.terminate()
      reject(new ActivityImportError('O navegador não conseguiu iniciar o processador local do arquivo.'))
    }
    worker.postMessage({ format, buffer, fileName }, [buffer])
  })
}

export async function importActivityFile(file: File): Promise<NormalizedActivity> {
  const format = validateActivityFileMetadata(file)
  const buffer = await file.arrayBuffer()
  if (typeof Worker === 'undefined') {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    const { parseActivityBuffer } = await import('./activity-parse.ts')
    return parseActivityBuffer(format, buffer, file.name)
  }
  return parseInWorker(format, buffer, file.name)
}
