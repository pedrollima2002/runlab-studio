import { XMLParser, XMLValidator } from 'fast-xml-parser'
import { normalizeActivity } from './activity-normalization.ts'
import type { ActivityLap, ActivityPosition, NormalizedActivity } from './activity-types.ts'

type XmlValue = Record<string, unknown>

function object(value: unknown): XmlValue | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as XmlValue : null
}

function array(value: unknown): unknown[] {
  return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value]
}

function objects(value: unknown): XmlValue[] {
  return array(value).flatMap((entry) => {
    const parsed = object(entry)
    return parsed ? [parsed] : []
  })
}

function text(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

function number(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : null
}

function nestedNumber(root: unknown, keys: string[]): number | null {
  let current: unknown = root
  for (const key of keys) current = object(current)?.[key]
  return number(current)
}

function position(trackpoint: XmlValue): ActivityPosition | null {
  const latitude = nestedNumber(trackpoint, ['Position', 'LatitudeDegrees'])
  const longitude = nestedNumber(trackpoint, ['Position', 'LongitudeDegrees'])
  return latitude !== null && longitude !== null ? { latitude, longitude } : null
}

function extensionSpeed(value: unknown): number | null {
  const root = object(value)
  if (!root) return null
  for (const [key, child] of Object.entries(root)) {
    if (key.toLowerCase() === 'speed') return number(child)
    const nested = extensionSpeed(child)
    if (nested !== null) return nested
  }
  return null
}

function weightedAverage(values: Array<{ value: number; weight: number }>): number | null {
  const valid = values.filter((entry) => entry.value > 0 && entry.weight > 0)
  const weight = valid.reduce((total, entry) => total + entry.weight, 0)
  return weight > 0 ? valid.reduce((total, entry) => total + entry.value * entry.weight, 0) / weight : null
}

export function parseTcxActivity(xml: string, fileName: string): NormalizedActivity {
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error('O TCX contém DOCTYPE ou entidades, que não são permitidos por segurança.')
  const validation = XMLValidator.validate(xml, { allowBooleanAttributes: false })
  if (validation !== true) throw new Error('O arquivo TCX está corrompido ou possui XML inválido.')

  const parsed = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    trimValues: true,
    processEntities: false,
  }).parse(xml)
  const database = object(object(parsed)?.TrainingCenterDatabase)
  const activities = objects(object(database?.Activities)?.Activity)
  if (!database || activities.length === 0) throw new Error('O XML não contém uma atividade TCX reconhecível.')

  const activity = activities[0]
  const sport = text(activity['@_Sport'])
  const lapsXml = objects(activity.Lap)
  const trackpoints = lapsXml.flatMap((lap) => objects(object(lap.Track)?.Trackpoint))
  const warnings = activities.length > 1 ? ['O TCX contém mais de uma atividade; somente a primeira foi importada.'] : []

  const lapMetrics = lapsXml.map((lap) => ({
    start: text(lap['@_StartTime']),
    seconds: number(lap.TotalTimeSeconds),
    distance: number(lap.DistanceMeters),
    averageHeartRate: nestedNumber(lap, ['AverageHeartRateBpm', 'Value']),
    maximumHeartRate: nestedNumber(lap, ['MaximumHeartRateBpm', 'Value']),
  }))
  const positiveLapTimes = lapMetrics.flatMap((lap) => lap.seconds !== null && lap.seconds > 0 ? [lap.seconds] : [])
  const positiveLapDistances = lapMetrics.flatMap((lap) => lap.distance !== null && lap.distance > 0 ? [lap.distance] : [])
  const averageHeartRate = weightedAverage(lapMetrics.flatMap((lap) => lap.averageHeartRate !== null && lap.seconds !== null
    ? [{ value: lap.averageHeartRate, weight: lap.seconds }]
    : []))
  const maximumHeartRates = lapMetrics.flatMap((lap) => lap.maximumHeartRate !== null ? [lap.maximumHeartRate] : [])

  const samples = trackpoints.flatMap((trackpoint) => {
    const timestamp = text(trackpoint.Time)
    if (!timestamp) return []
    return [{
      timestamp,
      distanceMeters: number(trackpoint.DistanceMeters),
      heartRateBpm: nestedNumber(trackpoint, ['HeartRateBpm', 'Value']),
      altitudeMeters: number(trackpoint.AltitudeMeters),
      speedMetersPerSecond: extensionSpeed(trackpoint.Extensions),
      position: position(trackpoint),
    }]
  })
  const availableFields: string[] = []
  if (positiveLapDistances.length || samples.some((sample) => sample.distanceMeters !== null)) availableFields.push('distância')
  if (positiveLapTimes.length) availableFields.push('tempo de cronômetro')
  if (samples.length > 1) availableFields.push('tempo decorrido')
  if (averageHeartRate !== null || maximumHeartRates.length || samples.some((sample) => sample.heartRateBpm !== null)) availableFields.push('frequência cardíaca')
  if (samples.some((sample) => sample.position)) availableFields.push('GPS')
  if (samples.some((sample) => sample.altitudeMeters !== null)) availableFields.push('altitude')
  if (lapsXml.length) availableFields.push('voltas originais')
  if (samples.some((sample) => sample.speedMetersPerSecond !== null)) availableFields.push('velocidade')

  const laps: ActivityLap[] = lapMetrics.map((lap) => ({
    startedAt: lap.start,
    endedAt: null,
    distanceMeters: lap.distance !== null && lap.distance >= 0 ? lap.distance : null,
    timerSeconds: lap.seconds !== null && lap.seconds > 0 ? lap.seconds : null,
    ascentMeters: null,
    descentMeters: null,
  }))

  if (samples.some((sample) => sample.altitudeMeters !== null)) {
    warnings.push('O TCX contém altitude absoluta, mas não um resumo confiável de subida/descida; essas métricas permanecem indisponíveis até uma metodologia validada.')
  }

  return normalizeActivity({
    format: 'tcx',
    fileName,
    sport,
    startedAt: text(activity.Id) ?? lapMetrics[0]?.start ?? null,
    distance: { value: positiveLapDistances.length ? positiveLapDistances.reduce((total, value) => total + value, 0) : null, source: 'tcx-laps' },
    timer: { value: positiveLapTimes.length ? positiveLapTimes.reduce((total, value) => total + value, 0) : null, source: 'tcx-laps' },
    averageHeartRate: { value: averageHeartRate, source: 'tcx-laps' },
    maximumHeartRate: { value: maximumHeartRates.length ? Math.max(...maximumHeartRates) : null, source: 'tcx-laps' },
    samples,
    laps,
    availableFields,
    warnings,
  })
}
