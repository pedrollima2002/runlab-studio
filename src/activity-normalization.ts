import type {
  ActivityCandidate,
  ActivityMetric,
  ActivityMetricSource,
  ActivitySample,
  NormalizedActivity,
} from './activity-types.ts'

const DISTANCE_DIVERGENCE_MINIMUM_METERS = 50
const DISTANCE_DIVERGENCE_RATIO = .01

function finitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function validHeartRate(value: unknown): value is number {
  return finitePositive(value) && value <= 250
}

function timestampMilliseconds(value: Date | string | null | undefined): number | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null
  if (typeof value !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value.trim())) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

function toIso(value: Date | string | null | undefined): string | null {
  const timestamp = timestampMilliseconds(value)
  return timestamp === null ? null : new Date(timestamp).toISOString()
}

function missingMetric(): ActivityMetric {
  return { value: null, status: 'missing', source: null }
}

function metric(value: unknown, source: ActivityMetricSource, note?: string): ActivityMetric {
  if (!finitePositive(value) || !source) return missingMetric()
  return { value, status: 'available', source, ...(note ? { note } : {}) }
}

function heartRateMetric(value: unknown, source: ActivityMetricSource): ActivityMetric {
  return validHeartRate(value) && source ? { value, status: 'available', source } : missingMetric()
}

function normalizeSamples(candidate: ActivityCandidate, warnings: string[]): ActivitySample[] {
  const samples = (candidate.samples ?? []).flatMap((sample, originalIndex) => {
    const timestamp = timestampMilliseconds(sample.timestamp)
    if (timestamp === null) {
      warnings.push(`Amostra ${originalIndex + 1} ignorada por possuir timestamp inválido ou sem fuso horário.`)
      return []
    }
    const position = sample.position
    const validPosition = position
      && Number.isFinite(position.latitude)
      && Number.isFinite(position.longitude)
      && Math.abs(position.latitude) <= 90
      && Math.abs(position.longitude) <= 180
      ? position
      : undefined
    return [{
      timestamp: new Date(timestamp).toISOString(),
      ...(finiteNonNegative(sample.distanceMeters) ? { distanceMeters: sample.distanceMeters } : {}),
      ...(validHeartRate(sample.heartRateBpm) ? { heartRateBpm: sample.heartRateBpm } : {}),
      ...(typeof sample.altitudeMeters === 'number' && Number.isFinite(sample.altitudeMeters) ? { altitudeMeters: sample.altitudeMeters } : {}),
      ...(finiteNonNegative(sample.speedMetersPerSecond) ? { speedMetersPerSecond: sample.speedMetersPerSecond } : {}),
      ...(validPosition ? { position: validPosition } : {}),
      originalIndex,
    }]
  })

  const wasOutOfOrder = samples.some((sample, index) => index > 0
    && timestampMilliseconds(sample.timestamp)! < timestampMilliseconds(samples[index - 1].timestamp)!)
  if (wasOutOfOrder) warnings.push('Registros fora de ordem foram reorganizados por timestamp; nenhuma duração negativa foi produzida.')
  samples.sort((left, right) => timestampMilliseconds(left.timestamp)! - timestampMilliseconds(right.timestamp)!)

  const deduplicated: ActivitySample[] = []
  for (const sampleWithIndex of samples) {
    const sample = Object.fromEntries(Object.entries(sampleWithIndex).filter(([key]) => key !== 'originalIndex')) as ActivitySample
    const previous = deduplicated.at(-1)
    if (previous?.timestamp !== sample.timestamp) {
      deduplicated.push(sample)
      continue
    }
    Object.assign(previous, Object.fromEntries(Object.entries(sample).filter(([, value]) => value !== undefined)))
  }
  if (deduplicated.length !== samples.length) warnings.push('Timestamps duplicados foram consolidados sem somar duração.')
  return deduplicated
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null
}

function makeId(format: string, startedAt: string | null, fileName: string): string {
  const input = `${format}:${startedAt ?? 'sem-data'}:${fileName}`
  let hash = 2166136261
  for (const character of input) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  return `runlab-${format}-${(hash >>> 0).toString(16)}`
}

export function calculateImportedPace(seconds: number | null, distanceMeters: number | null): number | null {
  if (!finitePositive(seconds) || !finitePositive(distanceMeters)) return null
  const pace = seconds / (distanceMeters / 1_000)
  return Number.isFinite(pace) && pace > 0 ? pace : null
}

export function normalizeActivity(candidate: ActivityCandidate): NormalizedActivity {
  const warnings = [...(candidate.warnings ?? [])]
  const samples = normalizeSamples(candidate, warnings)
  const explicitStartedAt = toIso(candidate.startedAt)
  if (candidate.startedAt && !explicitStartedAt) warnings.push('Data de início ignorada por ser inválida ou não informar fuso horário.')
  const startedAt = explicitStartedAt ?? samples[0]?.timestamp ?? null

  const sampleDistances = samples.flatMap((sample) => finiteNonNegative(sample.distanceMeters) ? [sample.distanceMeters] : [])
  const recordDistance = sampleDistances.length ? Math.max(...sampleDistances) : null
  const summaryDistance = finitePositive(candidate.distance?.value) ? candidate.distance.value : null
  const distanceSource = summaryDistance ? candidate.distance!.source : recordDistance && recordDistance > 0 ? (candidate.format === 'fit' ? 'fit-records' : 'tcx-trackpoints') : null
  const distance = metric(summaryDistance ?? recordDistance, distanceSource)
  if (summaryDistance && finitePositive(recordDistance)) {
    const tolerance = Math.max(DISTANCE_DIVERGENCE_MINIMUM_METERS, summaryDistance * DISTANCE_DIVERGENCE_RATIO)
    if (Math.abs(summaryDistance - recordDistance) > tolerance) {
      distance.status = 'inconsistent'
      distance.note = 'O resumo e as amostras divergem; o valor do resumo foi preservado.'
      warnings.push(`Distância do resumo (${Math.round(summaryDistance)} m) diverge das amostras (${Math.round(recordDistance)} m).`)
    }
  }

  const sampleStart = samples[0] ? timestampMilliseconds(samples[0].timestamp) : null
  const sampleEnd = samples.at(-1) ? timestampMilliseconds(samples.at(-1)!.timestamp) : null
  const timestampElapsed = sampleStart !== null && sampleEnd !== null && sampleEnd > sampleStart ? (sampleEnd - sampleStart) / 1_000 : null
  const summaryElapsed = finitePositive(candidate.elapsed?.value) ? candidate.elapsed.value : null
  const elapsed = metric(summaryElapsed ?? timestampElapsed, summaryElapsed ? candidate.elapsed!.source : timestampElapsed ? 'timestamps' : null)
  const timer = metric(candidate.timer?.value, candidate.timer?.source ?? null)
  const moving = metric(candidate.moving?.value, candidate.moving?.source ?? null)

  const heartRates = samples.flatMap((sample) => validHeartRate(sample.heartRateBpm) ? [sample.heartRateBpm] : [])
  const summaryAverageHeartRate = validHeartRate(candidate.averageHeartRate?.value) ? candidate.averageHeartRate.value : null
  const summaryMaximumHeartRate = validHeartRate(candidate.maximumHeartRate?.value) ? candidate.maximumHeartRate.value : null
  const averageHeartRate = heartRateMetric(summaryAverageHeartRate ?? average(heartRates), summaryAverageHeartRate ? candidate.averageHeartRate!.source : heartRates.length ? (candidate.format === 'fit' ? 'fit-records' : 'tcx-trackpoints') : null)
  const maximumHeartRate = heartRateMetric(summaryMaximumHeartRate ?? (heartRates.length ? Math.max(...heartRates) : null), summaryMaximumHeartRate ? candidate.maximumHeartRate!.source : heartRates.length ? (candidate.format === 'fit' ? 'fit-records' : 'tcx-trackpoints') : null)
  const elevationGain = metric(candidate.elevationGain?.value, candidate.elevationGain?.source ?? null)

  const paceTimeBasis = timer.value !== null ? 'timer' : elapsed.value !== null ? 'elapsed' : null
  const pace = calculateImportedPace(paceTimeBasis === 'timer' ? timer.value : elapsed.value, distance.value)
  const paceMetric = pace === null
    ? missingMetric()
    : { value: pace, status: distance.status, source: 'calculated' as const, note: paceTimeBasis === 'timer' ? 'Calculado com o tempo de cronômetro.' : 'Calculado com o tempo decorrido.' }

  return {
    id: makeId(candidate.format, startedAt, candidate.fileName),
    source: {
      format: candidate.format,
      fileName: candidate.fileName,
      availableFields: [...new Set(candidate.availableFields ?? [])].sort(),
    },
    sport: candidate.sport?.trim() || null,
    startedAt,
    metrics: {
      distanceMeters: distance,
      elapsedSeconds: elapsed,
      timerSeconds: timer,
      movingSeconds: moving,
      paceSecondsPerKilometer: paceMetric,
      averageHeartRateBpm: averageHeartRate,
      maximumHeartRateBpm: maximumHeartRate,
      elevationGainMeters: elevationGain,
    },
    paceTimeBasis,
    samples,
    laps: candidate.laps ?? [],
    warnings: [...new Set(warnings)],
  }
}
