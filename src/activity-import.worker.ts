/// <reference lib="webworker" />

import { parseActivityBuffer } from './activity-parse.ts'
import type { ActivitySourceFormat } from './activity-types.ts'

type ImportRequest = {
  format: ActivitySourceFormat
  buffer: ArrayBuffer
  fileName: string
}

self.onmessage = async ({ data }: MessageEvent<ImportRequest>) => {
  try {
    const activity = await parseActivityBuffer(data.format, data.buffer, data.fileName)
    self.postMessage({ activity })
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Falha inesperada ao processar o arquivo.' })
  }
}
