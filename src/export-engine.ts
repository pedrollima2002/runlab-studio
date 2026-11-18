import type { StickerData, StickerMetric } from './preview.tsx'
import { accentColors, textColors, type Appearance, type Template } from './studio-config.ts'

export const exportFormats = ['transparent', 'story', 'feed'] as const
export type ExportFormat = typeof exportFormats[number]

export const exportFormatDetails: Record<ExportFormat, {
  label: string
  description: string
  width: number
  height: number
}> = {
  transparent: {
    label: 'PNG transparente',
    description: 'Fundo transparente e área ajustada ao conteúdo',
    width: 1080,
    height: 1350,
  },
  story: {
    label: 'Story',
    description: '1080 × 1920 px · proporção 9:16',
    width: 1080,
    height: 1920,
  },
  feed: {
    label: 'Feed',
    description: '1080 × 1350 px · proporção 4:5',
    width: 1080,
    height: 1350,
  },
}

export type ExportResult = {
  blob: Blob
  width: number
  height: number
  filename: string
}

type SvgPlan = {
  width: number
  height: number
  svg: string
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character] ?? character)
}

export function wrapExportText(value: string, maximumCharacters = 24, maximumLines = 2): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['Sua corrida']

  const lines: string[] = []
  for (const word of words) {
    const current = lines.at(-1)
    if (!current) lines.push(word)
    else if (`${current} ${word}`.length <= maximumCharacters) lines[lines.length - 1] = `${current} ${word}`
    else if (lines.length < maximumLines) lines.push(word)
    else {
      lines[lines.length - 1] = `${current.slice(0, Math.max(1, maximumCharacters - 1))}…`
      break
    }
  }

  return lines.map((line) => line.length > maximumCharacters
    ? `${line.slice(0, Math.max(1, maximumCharacters - 1))}…`
    : line)
}

export function buildExportFilename(distance: string, format: ExportFormat): string {
  const normalizedDistance = distance
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(',', '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'corrida'
  return `runlab-${normalizedDistance}km-${format}.png`
}

function textLines(lines: string[], x: number, y: number, size: number, color: string, anchor = 'start'): string {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="750" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : Math.round(size * 1.16)}">${escapeXml(line)}</tspan>`).join('')}</text>`
}

function brand(x: number, y: number, color: string, accent: string, anchor = 'start'): string {
  const iconX = anchor === 'end' ? x - 178 : x
  const textX = anchor === 'end' ? x : x + 46
  return `<g aria-label="RUNLAB"><circle cx="${iconX + 15}" cy="${y - 11}" r="14" fill="none" stroke="${accent}" stroke-width="7"/><path d="M${iconX + 5} ${y + 12} L${iconX + 27} ${y - 34}" stroke="${accent}" stroke-width="7" stroke-linecap="round"/><text x="${textX}" y="${y}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="5" text-anchor="${anchor}">RUNLAB</text></g>`
}

function courseArt(x: number, y: number, width: number, height: number, accent: string): string {
  const scaleX = width / 250
  const scaleY = height / 180
  return `<g transform="translate(${x} ${y}) scale(${scaleX} ${scaleY})" fill="none" stroke="${accent}" stroke-linecap="round" stroke-linejoin="round"><path d="M-35 141 25 115 51 124 70 100 109 91 129 59 170 65 186 43 216 52 260 17 M-23 170 39 140 65 147 88 122 130 111 150 83 182 88 203 69 224 78 269 48 M-45 114 11 89 35 100 55 77 93 70 113 36 155 41 171 18 209 25 245 -4" opacity=".24" stroke-width="1.5"/><path d="m27 125 31-18 24 9 17-28 39-11 13-29 29 4 17 19 27-25" stroke-width="3.5"/><circle cx="27" cy="125" r="5" fill="${accent}" stroke="none"/><circle cx="224" cy="46" r="6" fill="${accent}" stroke="none"/></g>`
}

function metricGrid(metrics: StickerMetric[], x: number, y: number, width: number, color: string, accent: string, template: Template, compact: boolean): string {
  const count = Math.max(metrics.length, 1)
  const columns = template === 'Clean' ? 1 : Math.min(compact ? 3 : 2, count)
  const rows = Math.ceil(count / columns)
  const columnWidth = width / columns
  const rowHeight = compact ? 150 : Math.min(205, 530 / Math.max(rows, 1))

  return metrics.map((metric, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const metricX = x + column * columnWidth
    const metricY = y + row * rowHeight
    const featured = metric.key === 'distance' && template === 'Performance'
    const valueColor = featured ? accent : color
    const valueSize = featured ? (compact ? 66 : 78) : (compact ? 51 : 59)
    const unitX = metricX + Math.min(columnWidth - 20, metric.value.length * valueSize * .58 + 8)
    const divider = template === 'Clean'
      ? `<path d="M${metricX} ${metricY + 105} H${metricX + columnWidth - 12}" stroke="${color}" opacity=".22"/>`
      : `<path d="M${metricX} ${metricY - 30} H${metricX + columnWidth - 24}" stroke="${accent}" stroke-width="5"/>`
    return `<g>${divider}<text x="${metricX}" y="${metricY}" fill="${color}" opacity=".72" font-family="Inter, Arial, sans-serif" font-size="27">${escapeXml(metric.label)}</text><text x="${metricX}" y="${metricY + 66}" fill="${valueColor}" font-family="Inter, Arial, sans-serif" font-size="${valueSize}" font-weight="850">${escapeXml(metric.value)}</text>${metric.unit ? `<text x="${unitX}" y="${metricY + 66}" fill="${color}" opacity=".72" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="650">${escapeXml(metric.unit)}</text>` : ''}</g>`
  }).join('')
}

function background(template: Template, width: number, height: number, accent: string): string {
  if (template === 'Clean') return `<rect width="${width}" height="${height}" fill="url(#clean-bg)"/>`
  return `<rect width="${width}" height="${height}" fill="url(#dark-bg)"/><circle cx="${width * .92}" cy="${height * .30}" r="${width * .55}" fill="${accent}" opacity=".12"/>`
}

export function createExportSvg(data: StickerData, appearance: Appearance, format: ExportFormat): SvgPlan {
  const { width, height } = exportFormatDetails[format]
  const transparent = format === 'transparent'
  const compact = format !== 'story'
  const accent = accentColors[appearance.accentColor].value
  const color = textColors[appearance.textColor].value
  const template = appearance.template
  const margin = compact ? 82 : 96
  const titleLines = wrapExportText(data.title, compact ? 25 : 28, 2)
  const defs = `<defs><linearGradient id="dark-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#252d39"/><stop offset=".72" stop-color="#0b0e13"/></linearGradient><linearGradient id="clean-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf2"/><stop offset="1" stop-color="#e9dfd1"/></linearGradient></defs>`
  const bg = transparent ? '' : background(template, width, height, accent)
  let content = ''

  if (template === 'Minimal') {
    const titleY = compact ? 350 : 620
    const metricsY = compact ? 650 : 1020
    content = `${brand(margin, compact ? 125 : 150, color, accent)}${textLines(titleLines, appearance.layout === 'centered' ? width / 2 : margin, titleY, compact ? 67 : 76, color, appearance.layout === 'centered' ? 'middle' : 'start')}${data.date ? `<text x="${appearance.layout === 'centered' ? width / 2 : margin}" y="${titleY + 118}" fill="${color}" opacity=".72" font-family="Inter, Arial, sans-serif" font-size="28" text-anchor="${appearance.layout === 'centered' ? 'middle' : 'start'}">${escapeXml(data.date)}</text>` : ''}${metricGrid(data.metrics, margin, metricsY, width - margin * 2, color, accent, template, compact)}<rect x="${margin}" y="${height - (compact ? 95 : 130)}" width="180" height="12" rx="6" fill="${accent}"/>`
  } else if (template === 'Clean') {
    const courseY = compact ? 300 : 520
    const metricsY = compact ? 680 : 1120
    content = `${textLines(titleLines, margin, compact ? 150 : 175, compact ? 61 : 70, color)}${data.date ? `<text x="${margin}" y="${compact ? 300 : 355}" fill="${color}" opacity=".68" font-family="Inter, Arial, sans-serif" font-size="28">${escapeXml(data.date)}</text>` : ''}<text x="${width - margin}" y="${compact ? 125 : 150}" fill="${accent}" font-family="Inter, Arial, sans-serif" font-size="27" font-weight="900" letter-spacing="5" text-anchor="end">RUNLAB</text>${courseArt(margin, courseY, width - margin * 2, compact ? 270 : 390, accent)}${metricGrid(data.metrics, margin, metricsY, width - margin * 2, color, accent, template, compact)}${brand(width - margin, height - (compact ? 72 : 90), color, accent, 'end')}`
  } else {
    const courseY = compact ? 180 : 275
    const panelY = compact ? 520 : 900
    content = `${brand(margin, compact ? 115 : 145, color, accent)}${courseArt(margin, courseY, width - margin * 2, compact ? 300 : 460, accent)}<path d="M${margin} ${panelY} V${height - margin}" stroke="${accent}" stroke-width="9"/>${textLines(titleLines, margin + 40, panelY + 90, compact ? 60 : 68, color)}${data.date ? `<text x="${margin + 40}" y="${panelY + (titleLines.length > 1 ? 245 : 170)}" fill="${color}" opacity=".72" font-family="Inter, Arial, sans-serif" font-size="28">${escapeXml(data.date)}</text>` : ''}${metricGrid(data.metrics, margin + 40, panelY + (titleLines.length > 1 ? 365 : 290), width - margin * 2 - 60, color, accent, template, compact)}`
  }

  return {
    width,
    height,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${bg}${content}</svg>`,
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('O navegador não conseguiu codificar a imagem PNG.')), 'image/png', 1)
  })
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível preparar a composição para exportação.'))
    }
    image.src = url
  })
}

function cropTransparentCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const context = source.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas 2D indisponível neste navegador.')
  const pixels = context.getImageData(0, 0, source.width, source.height).data
  let left = source.width
  let top = source.height
  let right = -1
  let bottom = -1

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      if (pixels[(y * source.width + x) * 4 + 3] === 0) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left || bottom < top) throw new Error('A composição não possui conteúdo visível para exportar.')

  const padding = 32
  left = Math.max(0, left - padding)
  top = Math.max(0, top - padding)
  right = Math.min(source.width - 1, right + padding)
  bottom = Math.min(source.height - 1, bottom + padding)
  const cropped = document.createElement('canvas')
  cropped.width = right - left + 1
  cropped.height = bottom - top + 1
  cropped.getContext('2d')?.drawImage(source, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height)
  return cropped
}

export async function renderExport(data: StickerData, appearance: Appearance, format: ExportFormat, distance: string): Promise<ExportResult> {
  if (!document.createElement('canvas').getContext) throw new Error('Exportação por Canvas não é suportada neste navegador.')
  await document.fonts?.ready
  const plan = createExportSvg(data, appearance, format)
  const image = await loadSvg(plan.svg)
  const canvas = document.createElement('canvas')
  canvas.width = plan.width
  canvas.height = plan.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D indisponível neste navegador.')
  context.drawImage(image, 0, 0, plan.width, plan.height)
  const output = format === 'transparent' ? cropTransparentCanvas(canvas) : canvas
  const blob = await canvasToBlob(output)
  if (blob.type !== 'image/png' || blob.size < 1_000) throw new Error('O arquivo PNG gerado é inválido ou está vazio.')
  return { blob, width: output.width, height: output.height, filename: buildExportFilename(distance, format) }
}

export function downloadExport(result: ExportResult): void {
  const url = URL.createObjectURL(result.blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = result.filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
