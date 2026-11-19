import type { MetricKey } from './studio-config'
import type { RouteDrawing } from './route-geometry'
import type { RouteAppearance } from './studio-config'

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
  /** undefined = ilustração manual; null = atividade importada sem GPS */
  route?: { drawing: RouteDrawing; appearance: RouteAppearance } | null
}
