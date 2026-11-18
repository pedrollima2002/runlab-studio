import { Activity } from 'lucide-react'
import { demo, metrics, templates } from './demo'

type Template = typeof templates[number]
export type StickerData = {
  title: string
  distance: string
  duration: string
  pace: string
}

export function Metrics({ data }: { data?: StickerData }) {
  const visibleMetrics = data ? [
    { label: 'Distância', value: data.distance, unit: 'km' },
    { label: 'Tempo', value: data.duration, unit: '' },
    { label: 'Ritmo médio', value: data.pace, unit: 'min/km' },
  ] : metrics

  return <dl className="metrics">
    {visibleMetrics.map(({ label, value, unit }) => <div key={label}>
      <dt>{label}</dt><dd>{value} <small>{unit}</small></dd>
    </div>)}
  </dl>
}

export function CourseArt() {
  return <svg className="course" viewBox="0 0 250 180" fill="none" aria-hidden="true">
    <path d="M-35 141 25 115 51 124 70 100 109 91 129 59 170 65 186 43 216 52 260 17M-23 170 39 140 65 147 88 122 130 111 150 83 182 88 203 69 224 78 269 48M-45 114 11 89 35 100 55 77 93 70 113 36 155 41 171 18 209 25 245 -4" stroke="currentColor" opacity=".25"/>
    <path d="m27 125 31-18 24 9 17-28 39-11 13-29 29 4 17 19 27-25" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="27" cy="125" r="5" fill="currentColor"/><circle cx="224" cy="46" r="6" fill="currentColor"/>
  </svg>
}

export function Sticker({ template = 'Performance', data }: { template?: Template; data?: StickerData }) {
  return <div className={`sticker sticker-${template.toLowerCase()}`}>
    <span className="sticker-brand"><Activity size={18} aria-hidden="true" /> RUNLAB</span>
    <CourseArt />
    <div className="sticker-info"><p>{data?.title ?? demo.title}</p><Metrics data={data} /></div>
  </div>
}
