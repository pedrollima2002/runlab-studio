import type { CSSProperties } from 'react'
import { demo, metrics } from './demo'
import { createExportSvg, type ExportFormat } from './export-engine'
import type { StickerData } from './sticker-data'
import {
  accentColors,
  templateDefaults,
  textColors,
  type AccentColor,
  type MetricKey,
  type PreviewMode,
  type StickerLayout,
  type Template,
  type TextColor,
} from './studio-config'
export type { StickerData, StickerMetric } from './sticker-data'

export type StickerPhoto = {
  url: string
  placement: Record<string, string>
  darkness: number
  gradient: number
}

type StickerAppearance = {
  accentColor: AccentColor
  textColor: TextColor
  layout: StickerLayout
  mode: PreviewMode
}

const defaultData: StickerData = {
  title: demo.title,
  metrics: metrics.map((metric, index) => ({
    ...metric,
    key: (['distance', 'duration', 'pace'] as MetricKey[])[index],
  })),
}

export function Metrics({ data }: { data?: StickerData }) {
  const visibleMetrics = data?.metrics ?? defaultData.metrics

  return <dl className="metrics">
    {visibleMetrics.map(({ key, label, value, unit }) => <div className={`metric metric-${key}`} key={key}>
      <dt>{label}</dt><dd>{value} <small>{unit}</small></dd>
    </div>)}
  </dl>
}

export function CourseArt({ compact = false }: { compact?: boolean }) {
  return <svg className={`course${compact ? ' course-compact' : ''}`} viewBox="0 0 250 180" fill="none" aria-hidden="true">
    <path d="M-35 141 25 115 51 124 70 100 109 91 129 59 170 65 186 43 216 52 260 17M-23 170 39 140 65 147 88 122 130 111 150 83 182 88 203 69 224 78 269 48M-45 114 11 89 35 100 55 77 93 70 113 36 155 41 171 18 209 25 245 -4" stroke="currentColor" opacity=".25"/>
    <path d="m27 125 31-18 24 9 17-28 39-11 13-29 29 4 17 19 27-25" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="27" cy="125" r="5" fill="currentColor"/><circle cx="224" cy="46" r="6" fill="currentColor"/>
  </svg>
}

export function Sticker({
  template = 'Performance',
  data = defaultData,
  appearance,
  format = 'story',
  photo,
  showSafeArea = false,
}: {
  template?: Template
  data?: StickerData
  appearance?: StickerAppearance
  format?: ExportFormat
  photo?: StickerPhoto
  showSafeArea?: boolean
}) {
  const defaults = templateDefaults[template]
  const selectedAppearance = appearance ?? { ...defaults, mode: 'full' as const }
  const photoGradient = photo?.gradient ?? 0
  const cleanPhoto = template === 'Clean'
  const style = {
    '--sticker-accent': accentColors[selectedAppearance.accentColor].value,
    '--sticker-text': textColors[selectedAppearance.textColor].value,
    '--photo-darkness': photo?.darkness ?? 0,
    '--photo-gradient-top': photoGradient * (cleanPhoto ? .86 : .25),
    '--photo-gradient-middle': photoGradient * (cleanPhoto ? .18 : 0),
    '--photo-gradient-bottom': photoGradient * (cleanPhoto ? .78 : 1),
  } as CSSProperties
  const composition = createExportSvg(data, { ...selectedAppearance, template }, format, { hasPhoto: Boolean(photo) })

  return <article
    aria-label={`Figurinha ${template}`}
    className={`sticker sticker-${template.toLowerCase()} sticker-${selectedAppearance.layout} sticker-${selectedAppearance.mode}${photo ? ' sticker-photo' : ''}`}
    style={style}
  >
    <div className="sticker-render-surface">
      {photo && <div className="sticker-photo-layer" aria-hidden="true">
        <img alt="" draggable={false} src={photo.url} style={photo.placement} />
        <span className="photo-darkness" />
        <span className="photo-gradient" />
      </div>}
      <div aria-hidden="true" className="sticker-composition" dangerouslySetInnerHTML={{ __html: composition.svg }} />
    </div>
    <span className="sr-only">{data.title}. {data.metrics.map((metric) => `${metric.label}: ${metric.value} ${metric.unit}`).join('. ')}</span>
    {showSafeArea && <span className="safe-area-guide" aria-hidden="true" />}
  </article>
}
