import FitParser, { type ParsedFit } from 'fit-file-parser'
import { normalizeActivity } from './activity-normalization.ts'
import type { ActivityLap, ActivityPosition, NormalizedActivity } from './activity-types.ts'

type FitRecord = NonNullable<ParsedFit['records']>[number] & {
  distance?: number
  heart_rate?: number
  altitude?: number
  enhanced_altitude?: number
  speed?: number
  enhanced_speed?: number
  position_lat?: number
  position_long?: number
  timestamp?: Date
}

type FitSession = NonNullable<ParsedFit['sessions']>[number] & {
  timestamp?: Date
  start_time?: Date
  sport?: string
  total_distance?: number
  total_elapsed_time?: number
  total_timer_time?: number
  total_moving_time?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  total_ascent?: number
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function fitPosition(record: FitRecord): ActivityPosition | null {
  return finite(record.position_lat) && finite(record.position_long)
    ? { latitude: record.position_lat, longitude: record.position_long }
    : null
}

function selectSession(sessions: FitSession[]): FitSession | undefined {
  return [...sessions].sort((left, right) => (right.total_distance ?? right.total_timer_time ?? 0) - (left.total_distance ?? left.total_timer_time ?? 0))[0]
}

export function normalizeFit(parsed: ParsedFit, fileName: string): NormalizedActivity {
  const sessions = (parsed.sessions ?? []) as FitSession[]
  const session = selectSession(sessions)
  const allRecords = (parsed.records ?? []) as FitRecord[]
  const sessionStart = session?.start_time?.getTime()
  const sessionEnd = session?.timestamp?.getTime()
  const records = sessions.length > 1 && sessionStart !== undefined && sessionEnd !== undefined
    ? allRecords.filter((record) => record.timestamp instanceof Date && record.timestamp.getTime() >= sessionStart && record.timestamp.getTime() <= sessionEnd)
    : allRecords
  const warnings = sessions.length > 1 ? ['O arquivo contém mais de uma sessão; foi usada a sessão com maior distância ou duração.'] : []
  const availableFields: string[] = []

  if (session?.total_distance !== undefined || records.some((record) => record.distance !== undefined)) availableFields.push('distância')
  if (session?.total_timer_time !== undefined) availableFields.push('tempo de cronômetro')
  if (session?.total_elapsed_time !== undefined || records.length > 1) availableFields.push('tempo decorrido')
  if (session?.total_moving_time !== undefined) availableFields.push('tempo em movimento')
  if (session?.avg_heart_rate !== undefined || records.some((record) => record.heart_rate !== undefined)) availableFields.push('frequência cardíaca')
  if (session?.total_ascent !== undefined) availableFields.push('elevação acumulada do resumo')
  if (records.some((record) => fitPosition(record))) availableFields.push('GPS')
  if (records.some((record) => record.altitude !== undefined || record.enhanced_altitude !== undefined)) availableFields.push('altitude')
  if ((parsed.laps?.length ?? 0) > 0) availableFields.push('voltas originais')

  const laps: ActivityLap[] = (parsed.laps ?? []).map((lap) => {
    const typedLap = lap as typeof lap & { start_time?: Date; total_distance?: number; total_timer_time?: number }
    return {
      startedAt: typedLap.start_time instanceof Date ? typedLap.start_time.toISOString() : null,
      distanceMeters: finite(typedLap.total_distance) && typedLap.total_distance >= 0 ? typedLap.total_distance : null,
      timerSeconds: finite(typedLap.total_timer_time) && typedLap.total_timer_time > 0 ? typedLap.total_timer_time : null,
    }
  })

  return normalizeActivity({
    format: 'fit',
    fileName,
    sport: session?.sport ?? null,
    startedAt: session?.start_time ?? null,
    distance: { value: session?.total_distance, source: 'fit-session' },
    elapsed: { value: session?.total_elapsed_time, source: 'fit-session' },
    timer: { value: session?.total_timer_time, source: 'fit-session' },
    moving: { value: session?.total_moving_time, source: 'fit-session' },
    averageHeartRate: { value: session?.avg_heart_rate, source: 'fit-session' },
    maximumHeartRate: { value: session?.max_heart_rate, source: 'fit-session' },
    elevationGain: { value: session?.total_ascent, source: 'fit-session' },
    samples: records.flatMap((record) => record.timestamp instanceof Date ? [{
      timestamp: record.timestamp,
      distanceMeters: record.distance,
      heartRateBpm: record.heart_rate,
      altitudeMeters: record.enhanced_altitude ?? record.altitude,
      speedMetersPerSecond: record.enhanced_speed ?? record.speed,
      position: fitPosition(record),
    }] : []),
    laps,
    availableFields,
    warnings,
  })
}

export async function parseFitActivity(buffer: ArrayBuffer, fileName: string): Promise<NormalizedActivity> {
  try {
    const parser = new FitParser({
      force: false,
      strict: true,
      mode: 'list',
      lengthUnit: 'm',
      speedUnit: 'm/s',
    })
    return normalizeFit(await parser.parseAsync(buffer), fileName)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`O arquivo FIT está corrompido ou não é compatível. ${reason}`)
  }
}
