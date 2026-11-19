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
  total_descent?: number
  num_laps?: number
}

type FitLap = NonNullable<ParsedFit['laps']>[number] & {
  timestamp?: Date
  start_time?: Date
  total_distance?: number
  total_timer_time?: number
  total_ascent?: number
  total_descent?: number
}

type FitEvent = NonNullable<ParsedFit['events']>[number] & {
  timestamp?: Date
  event?: string
  event_type?: string
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function finiteNonNegative(value: unknown): value is number {
  return finite(value) && value >= 0
}

function fitPosition(record: FitRecord): ActivityPosition | null {
  return finite(record.position_lat) && finite(record.position_long)
    ? { latitude: record.position_lat, longitude: record.position_long }
    : null
}

function selectSession(sessions: FitSession[]): FitSession | undefined {
  return [...sessions].sort((left, right) => (right.total_distance ?? right.total_timer_time ?? 0) - (left.total_distance ?? left.total_timer_time ?? 0))[0]
}

function withinSession(timestamp: Date | undefined, session: FitSession | undefined): boolean {
  if (!timestamp || !session?.start_time || !session.timestamp) return false
  return timestamp >= session.start_time && timestamp <= session.timestamp
}

function selectLaps(laps: FitLap[], session: FitSession | undefined, multipleSessions: boolean): FitLap[] {
  if (!multipleSessions) return laps
  return laps.filter((lap) => withinSession(lap.start_time, session) && withinSession(lap.timestamp, session))
}

function lapsSafelyCoverSession(laps: FitLap[], session: FitSession | undefined): boolean {
  if (!session || laps.length === 0) return false
  if (finite(session.num_laps) && session.num_laps !== laps.length) return false
  const ordered = [...laps].sort((left, right) => (left.start_time?.getTime() ?? 0) - (right.start_time?.getTime() ?? 0))
  const noOverlap = ordered.every((lap, index) => index === 0
    || !ordered[index - 1].timestamp
    || !lap.start_time
    || ordered[index - 1].timestamp!.getTime() <= lap.start_time.getTime())
  if (!noOverlap) return false

  const lapDistance = laps.every((lap) => finiteNonNegative(lap.total_distance))
    ? laps.reduce((total, lap) => total + lap.total_distance!, 0)
    : null
  const distanceCovered = finiteNonNegative(session.total_distance) && lapDistance !== null
    && Math.abs(lapDistance - session.total_distance) <= Math.max(50, session.total_distance * .01)
  const lapTimer = laps.every((lap) => finiteNonNegative(lap.total_timer_time))
    ? laps.reduce((total, lap) => total + lap.total_timer_time!, 0)
    : null
  const timerCovered = finiteNonNegative(session.total_timer_time) && lapTimer !== null
    && Math.abs(lapTimer - session.total_timer_time) <= 1
  const boundariesCovered = session.start_time instanceof Date && session.timestamp instanceof Date
    && ordered[0].start_time instanceof Date && ordered.at(-1)?.timestamp instanceof Date
    && Math.abs(ordered[0].start_time!.getTime() - session.start_time.getTime()) <= 1_000
    && Math.abs(ordered.at(-1)!.timestamp!.getTime() - session.timestamp.getTime()) <= 1_000
  return distanceCovered || timerCovered || boundariesCovered
}

function lapElevation(laps: FitLap[], session: FitSession | undefined, field: 'total_ascent' | 'total_descent'): number | null {
  if (!lapsSafelyCoverSession(laps, session) || !laps.every((lap) => finiteNonNegative(lap[field]))) return null
  return laps.reduce((total, lap) => total + lap[field]!, 0)
}

export function normalizeFit(parsed: ParsedFit, fileName: string): NormalizedActivity {
  const sessions = (parsed.sessions ?? []) as FitSession[]
  const session = selectSession(sessions)
  const allRecords = (parsed.records ?? []) as FitRecord[]
  const allLaps = (parsed.laps ?? []) as FitLap[]
  const allEvents = (parsed.events ?? []) as FitEvent[]
  const sessionStart = session?.start_time?.getTime()
  const sessionEnd = session?.timestamp?.getTime()
  const records = sessions.length > 1 && sessionStart !== undefined && sessionEnd !== undefined
    ? allRecords.filter((record) => record.timestamp instanceof Date && record.timestamp.getTime() >= sessionStart && record.timestamp.getTime() <= sessionEnd)
    : allRecords
  const selectedLaps = selectLaps(allLaps, session, sessions.length > 1)
  const events = sessions.length > 1 ? allEvents.filter((event) => withinSession(event.timestamp, session)) : allEvents
  const warnings = sessions.length > 1 ? ['O arquivo contém mais de uma sessão; foi usada a sessão com maior distância ou duração, sem misturar seus registros e voltas.'] : []
  const availableFields: string[] = []

  const sessionAscent = finiteNonNegative(session?.total_ascent) ? session.total_ascent : null
  const sessionDescent = finiteNonNegative(session?.total_descent) ? session.total_descent : null
  const lapAscent = sessionAscent === null ? lapElevation(selectedLaps, session, 'total_ascent') : null
  const lapDescent = sessionDescent === null ? lapElevation(selectedLaps, session, 'total_descent') : null
  const ascent = sessionAscent ?? lapAscent
  const descent = sessionDescent ?? lapDescent
  const ascentSource = sessionAscent !== null ? 'fit-session' as const : lapAscent !== null ? 'fit-laps' as const : 'fit-session' as const
  const descentSource = sessionDescent !== null ? 'fit-session' as const : lapDescent !== null ? 'fit-laps' as const : 'fit-session' as const
  if (sessionAscent === null && lapAscent !== null) warnings.push('Subida acumulada ausente na sessão; foi usada a soma das voltas que cobrem integralmente a sessão.')
  if (sessionDescent === null && lapDescent !== null) warnings.push('Descida acumulada ausente na sessão; foi usada a soma das voltas que cobrem integralmente a sessão.')
  if (session?.total_ascent === undefined && selectedLaps.some((lap) => lap.total_ascent !== undefined) && lapAscent === null) warnings.push('A subida das voltas não foi agregada porque não foi possível comprovar cobertura integral sem sobreposição.')
  if (session?.total_descent === undefined && selectedLaps.some((lap) => lap.total_descent !== undefined) && lapDescent === null) warnings.push('A descida das voltas não foi agregada porque não foi possível comprovar cobertura integral sem sobreposição.')

  if (session?.total_distance !== undefined || records.some((record) => record.distance !== undefined)) availableFields.push('distância')
  if (session?.total_timer_time !== undefined) availableFields.push('tempo de cronômetro')
  if (session?.total_elapsed_time !== undefined || records.length > 1) availableFields.push('tempo decorrido')
  if (session?.total_moving_time !== undefined) availableFields.push('tempo em movimento')
  if (session?.avg_heart_rate !== undefined || records.some((record) => record.heart_rate !== undefined)) availableFields.push('frequência cardíaca')
  if (ascent !== null) availableFields.push('subida acumulada')
  if (descent !== null) availableFields.push('descida acumulada')
  if (records.some((record) => fitPosition(record))) availableFields.push('GPS')
  if (records.some((record) => record.altitude !== undefined || record.enhanced_altitude !== undefined)) availableFields.push('altitude')
  if (selectedLaps.length > 0) availableFields.push('voltas originais')
  if (events.some((event) => event.event === 'timer')) availableFields.push('eventos do cronômetro')
  if (!finiteNonNegative(session?.total_moving_time) && events.some((event) => event.event === 'timer' && event.event_type !== 'start')) {
    warnings.push('Eventos de pausa/retomada foram preservados, mas não são usados para inventar tempo em movimento.')
  }

  const laps: ActivityLap[] = selectedLaps.map((typedLap) => {
    return {
      startedAt: typedLap.start_time instanceof Date ? typedLap.start_time.toISOString() : null,
      endedAt: typedLap.timestamp instanceof Date ? typedLap.timestamp.toISOString() : null,
      distanceMeters: finite(typedLap.total_distance) && typedLap.total_distance >= 0 ? typedLap.total_distance : null,
      timerSeconds: finite(typedLap.total_timer_time) && typedLap.total_timer_time > 0 ? typedLap.total_timer_time : null,
      ascentMeters: finiteNonNegative(typedLap.total_ascent) ? typedLap.total_ascent : null,
      descentMeters: finiteNonNegative(typedLap.total_descent) ? typedLap.total_descent : null,
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
    ascent: { value: ascent, source: ascentSource },
    descent: { value: descent, source: descentSource },
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
