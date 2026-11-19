import type { MetricKey } from './studio-config'

export type StickerMetric = {
  key: MetricKey
  label: string
  value: string
  unit: string
}

export type StickerData = {
  title: string
  date?: string
  metrics: StickerMetric[]
}
