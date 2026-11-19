import type { NormalizedActivity } from './activity-types.ts'
import type { ActivityData, EditorState, ImportedActivityReference } from './studio-config.ts'

function positive(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0
}

function optionalNonNegative(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 ? value : null
}

function formatDecimal(value: number): string {
  return String(Math.round(value * 1_000_000) / 1_000_000).replace('.', ',')
}

function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3_600)
  const minutes = Math.floor((rounded % 3_600) / 60)
  const remainder = rounded % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${minutes}:${String(remainder).padStart(2, '0')}`
}

function suggestedTitle(sport: string | null): string {
  if (sport?.toLowerCase() === 'running') return 'Corrida importada'
  if (sport?.toLowerCase() === 'walking') return 'Caminhada importada'
  if (sport?.toLowerCase() === 'biking') return 'Pedal importado'
  return 'Atividade importada'
}

function transferMetrics(activity: NormalizedActivity): {
  distanceMeters: number
  durationSeconds: number
  durationBasis: 'timer' | 'elapsed'
  paceSecondsPerKilometer: number
} | null {
  const distanceMeters = activity.metrics.distanceMeters.value
  const paceSecondsPerKilometer = activity.metrics.paceSecondsPerKilometer.value
  const durationBasis = activity.paceTimeBasis
  const durationSeconds = durationBasis === 'timer'
    ? activity.metrics.timerSeconds.value
    : durationBasis === 'elapsed'
      ? activity.metrics.elapsedSeconds.value
      : null
  if (!positive(distanceMeters) || !positive(durationSeconds) || !positive(paceSecondsPerKilometer) || !durationBasis) return null
  return { distanceMeters, durationSeconds, durationBasis, paceSecondsPerKilometer }
}

export function canTransferActivityToStudio(activity: NormalizedActivity): boolean {
  return transferMetrics(activity) !== null
}

export function adaptActivityToStudio(activity: NormalizedActivity, base: EditorState): EditorState {
  const metrics = transferMetrics(activity)
  if (!metrics) throw new Error('A atividade precisa ter distância, duração e pace válidos para criar uma figurinha.')

  const averageHeartRateBpm = positive(activity.metrics.averageHeartRateBpm.value) ? activity.metrics.averageHeartRateBpm.value : null
  const maximumHeartRateBpm = positive(activity.metrics.maximumHeartRateBpm.value) ? activity.metrics.maximumHeartRateBpm.value : null
  const ascentMeters = optionalNonNegative(activity.metrics.ascentMeters.value)
  const descentMeters = optionalNonNegative(activity.metrics.descentMeters.value)
  const original: ActivityData = {
    distance: formatDecimal(metrics.distanceMeters / 1_000),
    duration: formatDuration(metrics.durationSeconds),
    title: suggestedTitle(activity.sport),
    date: activity.startedAt?.slice(0, 10) ?? '',
    heartRate: averageHeartRateBpm === null ? '' : String(Math.round(averageHeartRateBpm)),
    elevation: ascentMeters === null ? '' : formatDecimal(ascentMeters),
  }
  const reference: ImportedActivityReference = {
    format: activity.source.format,
    durationBasis: metrics.durationBasis,
    distanceMeters: metrics.distanceMeters,
    durationSeconds: metrics.durationSeconds,
    paceSecondsPerKilometer: metrics.paceSecondsPerKilometer,
    averageHeartRateBpm,
    maximumHeartRateBpm,
    ascentMeters,
    descentMeters,
    startedAt: activity.startedAt,
    original: { ...original },
  }

  return {
    activity: original,
    appearance: {
      ...base.appearance,
      visibility: {
        ...base.appearance.visibility,
        distance: true,
        duration: true,
        pace: true,
        heartRate: averageHeartRateBpm !== null,
        elevation: ascentMeters !== null,
      },
    },
    provenance: { kind: 'imported', edited: false, reference },
  }
}

export function enableManualMetricEditing(state: EditorState): EditorState {
  return state.provenance.kind === 'imported'
    ? { ...state, provenance: { ...state.provenance, edited: true } }
    : state
}

export function restoreImportedMetrics(state: EditorState): EditorState {
  if (state.provenance.kind !== 'imported') return state
  return {
    ...state,
    activity: { ...state.provenance.reference.original, title: state.activity.title },
    provenance: { ...state.provenance, edited: false },
  }
}
