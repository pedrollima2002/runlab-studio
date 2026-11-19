import type { ActivitySample, NormalizedActivity } from './activity-types.ts'

export type RoutePoint = {
  latitude: number
  longitude: number
  timestamp: string
  distanceMeters?: number
}

export type ActivityRoute = {
  format: 'fit' | 'tcx'
  segments: RoutePoint[][]
  originalPointCount: number
  warnings: string[]
}

export type RouteDrawing = {
  paths: string[]
  start: { x: number; y: number }
  end: { x: number; y: number }
  originalPointCount: number
  simplifiedPointCount: number
  trimmed: boolean
  warning: string | null
}

const EARTH_RADIUS_METERS = 6_371_000

function validCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

export function haversineMeters(first: Pick<RoutePoint, 'latitude' | 'longitude'>, second: Pick<RoutePoint, 'latitude' | 'longitude'>): number {
  const radians = Math.PI / 180
  const latitudeDelta = (second.latitude - first.latitude) * radians
  const longitudeDelta = (second.longitude - first.longitude) * radians
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(first.latitude * radians) * Math.cos(second.latitude * radians) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)))
}

function toPoint(sample: ActivitySample): RoutePoint | null {
  if (!sample.position || !validCoordinate(sample.position.latitude, sample.position.longitude)) return null
  return {
    latitude: sample.position.latitude,
    longitude: sample.position.longitude,
    timestamp: sample.timestamp,
    ...(sample.distanceMeters === undefined ? {} : { distanceMeters: sample.distanceMeters }),
  }
}

function isImplausibleJump(previous: RoutePoint, next: RoutePoint): boolean {
  const distance = haversineMeters(previous, next)
  const seconds = (Date.parse(next.timestamp) - Date.parse(previous.timestamp)) / 1_000
  return distance > 100_000 || (seconds > 0 && seconds <= 120 && distance / seconds > 100)
}

export function extractActivityRoute(activity: NormalizedActivity): ActivityRoute | null {
  const segments: RoutePoint[][] = []
  let active: RoutePoint[] = []
  let activeSegmentId: string | undefined
  let rejectedJumps = 0
  let duplicates = 0

  const flush = () => {
    if (active.length >= 2) segments.push(active)
    active = []
  }

  for (const sample of activity.samples) {
    const point = toPoint(sample)
    if (!point) continue
    if (active.length && sample.segmentId !== activeSegmentId) flush()
    activeSegmentId = sample.segmentId
    const previous = active.at(-1)
    if (previous && previous.latitude === point.latitude && previous.longitude === point.longitude) {
      duplicates += 1
      continue
    }
    if (previous && isImplausibleJump(previous, point)) {
      rejectedJumps += 1
      flush()
    }
    active.push(point)
  }
  flush()
  if (!segments.length) return null
  return {
    format: activity.source.format,
    segments,
    originalPointCount: segments.reduce((total, segment) => total + segment.length, 0),
    warnings: [
      ...(duplicates ? [`${duplicates} ponto(s) GPS duplicado(s) foram ignorados.`] : []),
      ...(rejectedJumps ? [`${rejectedJumps} salto(s) GPS improvável(is) foram separado(s) do trajeto.`] : []),
    ],
  }
}

function interpolate(first: RoutePoint, second: RoutePoint, ratio: number): RoutePoint {
  return {
    latitude: first.latitude + (second.latitude - first.latitude) * ratio,
    longitude: first.longitude + (second.longitude - first.longitude) * ratio,
    timestamp: first.timestamp,
  }
}

function trimSegment(segment: RoutePoint[], startMeters: number, endMeters: number): RoutePoint[] {
  const cumulative = [0]
  for (let index = 1; index < segment.length; index += 1) cumulative.push(cumulative[index - 1] + haversineMeters(segment[index - 1], segment[index]))
  const total = cumulative.at(-1) ?? 0
  const from = Math.min(startMeters, total)
  const to = Math.max(from, total - endMeters)
  if (to - from <= 1e-6) return []
  const result: RoutePoint[] = []
  for (let index = 1; index < segment.length; index += 1) {
    const lower = cumulative[index - 1]
    const upper = cumulative[index]
    if (upper < from || lower > to || upper === lower) continue
    if (!result.length) result.push(interpolate(segment[index - 1], segment[index], Math.max(0, (from - lower) / (upper - lower))))
    if (upper <= to) result.push(segment[index])
    else {
      result.push(interpolate(segment[index - 1], segment[index], Math.min(1, (to - lower) / (upper - lower))))
      break
    }
  }
  return result.length >= 2 ? result : []
}

function trimRoute(segments: RoutePoint[][], trimMeters: number): { segments: RoutePoint[][]; warning: string | null } {
  if (trimMeters <= 0) return { segments, warning: null }
  const lengths = segments.map((segment) => segment.slice(1).reduce((total, point, index) => total + haversineMeters(segment[index], point), 0))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  if (total <= trimMeters * 2) return { segments: [], warning: 'O trajeto é curto demais para aplicar este recorte de privacidade.' }
  let startRemaining = trimMeters
  let endRemaining = trimMeters
  const result = segments.map((segment, index) => {
    const start = startRemaining > 0 ? Math.min(startRemaining, lengths[index]) : 0
    startRemaining -= start
    return { segment, start, index, end: 0 }
  })
  // Apply the end budget from the final segment backwards.
  for (let index = result.length - 1; index >= 0 && endRemaining > 0; index -= 1) {
    const amount = Math.min(endRemaining, lengths[index])
    result[index].end = amount
    endRemaining -= amount
  }
  return { segments: result.map(({ segment, start, end }) => trimSegment(segment, start, end)).filter((segment) => segment.length >= 2), warning: null }
}

type XY = { x: number; y: number }

function perpendicularDistance(point: XY, first: XY, last: XY): number {
  const dx = last.x - first.x
  const dy = last.y - first.y
  if (dx === 0 && dy === 0) return Math.hypot(point.x - first.x, point.y - first.y)
  const t = Math.max(0, Math.min(1, ((point.x - first.x) * dx + (point.y - first.y) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(point.x - (first.x + t * dx), point.y - (first.y + t * dy))
}

function simplify(points: XY[], tolerance: number): XY[] {
  if (points.length <= 2) return points
  let maximum = 0
  let split = 0
  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = perpendicularDistance(points[index], points[0], points.at(-1)!)
    if (distance > maximum) { maximum = distance; split = index }
  }
  if (maximum <= tolerance) return [points[0], points.at(-1)!]
  return [...simplify(points.slice(0, split + 1), tolerance).slice(0, -1), ...simplify(points.slice(split), tolerance)]
}

export function createRouteDrawing(route: ActivityRoute, trimMeters = 0): RouteDrawing | null {
  const trimmed = trimRoute(route.segments, trimMeters)
  if (!trimmed.segments.length) return trimmed.warning ? {
    paths: [], start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, originalPointCount: route.originalPointCount,
    simplifiedPointCount: 0, trimmed: trimMeters > 0, warning: trimmed.warning,
  } : null
  const all = trimmed.segments.flat()
  const meanLatitude = all.reduce((sum, point) => sum + point.latitude, 0) / all.length
  const cosine = Math.max(.01, Math.cos(meanLatitude * Math.PI / 180))
  const longitudeReference = trimmed.segments[0][0].longitude
  const projected = trimmed.segments.map((segment) => {
    let previousLongitude = segment[0].longitude
    let unwrapped = previousLongitude
    while (unwrapped - longitudeReference > 180) unwrapped -= 360
    while (unwrapped - longitudeReference < -180) unwrapped += 360
    return segment.map((point, index) => {
      if (index > 0) {
        let delta = point.longitude - previousLongitude
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        unwrapped += delta
        previousLongitude = point.longitude
      }
      return { x: unwrapped * cosine, y: -point.latitude }
    })
  })
  const coordinates = projected.flat()
  const minX = Math.min(...coordinates.map((point) => point.x)); const maxX = Math.max(...coordinates.map((point) => point.x))
  const minY = Math.min(...coordinates.map((point) => point.y)); const maxY = Math.max(...coordinates.map((point) => point.y))
  const width = Math.max(maxX - minX, 1e-9); const height = Math.max(maxY - minY, 1e-9)
  const scale = Math.min(226 / width, 156 / height)
  const offsetX = 125 - ((minX + maxX) / 2) * scale
  const offsetY = 90 - ((minY + maxY) / 2) * scale
  const normalized = projected.map((segment) => segment.map((point) => ({ x: point.x * scale + offsetX, y: point.y * scale + offsetY })))
  const simplified = normalized.map((segment) => {
    const stride = Math.max(1, Math.ceil(segment.length / 1_000))
    const bounded = stride === 1 ? segment : segment.filter((_, index) => index % stride === 0 || index === segment.length - 1)
    return simplify(bounded, .7)
  })
  const path = (points: XY[]) => points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
  const first = simplified[0][0]
  const last = simplified.at(-1)!.at(-1)!
  return {
    paths: simplified.map(path), start: first, end: last, originalPointCount: route.originalPointCount,
    simplifiedPointCount: simplified.reduce((total, segment) => total + segment.length, 0),
    trimmed: trimMeters > 0, warning: trimmed.warning,
  }
}
